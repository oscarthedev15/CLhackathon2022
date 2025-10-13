// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BetFactory
 * @notice Modern peer-to-peer betting platform with Chainlink Functions verification
 * @dev Manual bet resolution using Chainlink Functions for API data retrieval
 */
contract BetFactory is FunctionsClient, ReentrancyGuard, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    // Custom errors (gas efficient)
    error InsufficientBetAmount();
    error InvalidAcceptValue();
    error InvalidDates();
    error BetNotActive();
    error BetAlreadyAccepted();
    error IncorrectAcceptAmount();
    error AcceptDeadlinePassed();
    error TransferFailed();

    enum BetStatus {
        Active,
        Accepted,
        Resolved,
        Cancelled
    }

    struct Bet {
        address payable creator;
        address payable acceptor;
        uint256 creatorAmount;
        uint256 acceptorAmount;
        uint256 targetValue;
        uint256 acceptByDate;
        uint256 expirationDate;
        BetStatus status;
        address winner;
    }

    // State variables
    uint256 private _betIdCounter;
    uint256 public minimumBetAmount;
    uint256 public serviceFeePercentage; // Basis points (500 = 5%)
    address payable public treasury;

    // Chainlink Functions
    bytes32 public donId;
    uint64 public subscriptionId;
    uint32 public gasLimit;
    string public source; // JavaScript source code for API call

    // Mappings
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => string) public betTitles;
    mapping(uint256 => string) public creatorApiURLs;
    mapping(uint256 => string) public acceptorApiURLs;
    mapping(bytes32 => uint256) private requestIdToBetId;
    mapping(address => uint256[]) public userBets;

    // Arrays for tracking bets
    uint256[] private activeBetIds;
    uint256[] private acceptedBetIds;
    mapping(uint256 => uint256) private activeBetIndex;
    mapping(uint256 => uint256) private acceptedBetIndex;

    // Events
    event BetCreated(
        uint256 indexed betId,
        address indexed creator,
        uint256 creatorAmount,
        uint256 acceptorAmount
    );
    event BetAccepted(uint256 indexed betId, address indexed acceptor);
    event BetResolved(
        uint256 indexed betId,
        address indexed winner,
        uint256 amount
    );
    event BetCancelled(
        uint256 indexed betId,
        address indexed creator,
        uint256 refundAmount
    );
    event OracleRequestSent(uint256 indexed betId, bytes32 indexed requestId);

    constructor(
        uint256 _minimumBetAmount,
        uint256 _serviceFeePercentage,
        address _functionsRouter,
        bytes32 _donId,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        string memory _source,
        address payable _treasury
    ) FunctionsClient(_functionsRouter) {
        minimumBetAmount = _minimumBetAmount;
        serviceFeePercentage = _serviceFeePercentage;
        treasury = _treasury;
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        source = _source;
    }

    // ============ Configuration ============

    function updateConfig(
        uint256 _minimumBet,
        uint256 _serviceFee,
        address payable _treasury
    ) external onlyOwner {
        minimumBetAmount = _minimumBet;
        serviceFeePercentage = _serviceFee;
        treasury = _treasury;
    }

    function updateFunctionsConfig(
        bytes32 _donId,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        string memory _source
    ) external onlyOwner {
        donId = _donId;
        subscriptionId = _subscriptionId;
        gasLimit = _gasLimit;
        source = _source;
    }

    // ============ Bet Creation & Acceptance ============

    function createBet(
        string calldata _title,
        string calldata _apiURL,
        uint256 _acceptorAmount,
        uint256 _targetValue,
        uint256 _acceptByDate,
        uint256 _expirationDate
    ) external payable nonReentrant returns (uint256) {
        uint256 serviceFee = (msg.value * serviceFeePercentage) / 10000;
        uint256 betAmount = msg.value - serviceFee;

        if (betAmount < minimumBetAmount) revert InsufficientBetAmount();
        if (_acceptorAmount < minimumBetAmount) revert InvalidAcceptValue();
        if (
            _acceptByDate >= _expirationDate || _acceptByDate <= block.timestamp
        ) revert InvalidDates();

        uint256 betId = _betIdCounter++;

        bets[betId] = Bet({
            creator: payable(msg.sender),
            acceptor: payable(address(0)),
            creatorAmount: betAmount,
            acceptorAmount: _acceptorAmount,
            targetValue: _targetValue,
            acceptByDate: _acceptByDate,
            expirationDate: _expirationDate,
            status: BetStatus.Active,
            winner: address(0)
        });

        betTitles[betId] = _title;
        creatorApiURLs[betId] = _apiURL;

        activeBetIds.push(betId);
        activeBetIndex[betId] = activeBetIds.length - 1;
        userBets[msg.sender].push(betId);

        if (serviceFee > 0) {
            (bool success, ) = treasury.call{value: serviceFee}("");
            if (!success) revert TransferFailed();
        }

        emit BetCreated(betId, msg.sender, betAmount, _acceptorAmount);
        return betId;
    }

    function acceptBet(
        uint256 _betId,
        string calldata _apiURL
    ) external payable nonReentrant {
        Bet storage bet = bets[_betId];

        if (bet.status != BetStatus.Active) revert BetNotActive();
        if (bet.acceptor != address(0)) revert BetAlreadyAccepted();
        if (block.timestamp > bet.acceptByDate) revert AcceptDeadlinePassed();

        // Calculate required amount: acceptorAmount + service fee
        uint256 requiredAmount = bet.acceptorAmount +
            (bet.acceptorAmount * serviceFeePercentage) /
            10000;
        if (msg.value != requiredAmount) revert IncorrectAcceptAmount();

        uint256 serviceFee = (bet.acceptorAmount * serviceFeePercentage) /
            10000;

        bet.acceptor = payable(msg.sender);
        bet.status = BetStatus.Accepted;
        acceptorApiURLs[_betId] = _apiURL;

        _removeFromActiveBets(_betId);
        acceptedBetIds.push(_betId);
        acceptedBetIndex[_betId] = acceptedBetIds.length - 1;
        userBets[msg.sender].push(_betId);

        if (serviceFee > 0) {
            (bool success, ) = treasury.call{value: serviceFee}("");
            if (!success) revert TransferFailed();
        }

        emit BetAccepted(_betId, msg.sender);
    }

    // ============ Manual Bet Resolution ============

    /**
     * @notice Allows bet participants to manually check and resolve a bet
     * @dev Sends a request to Chainlink Functions to fetch API data
     * @param _betId The ID of the bet to check
     */
    function checkBet(
        uint256 _betId
    ) external nonReentrant returns (bytes32 requestId) {
        Bet storage bet = bets[_betId];
        if (bet.status != BetStatus.Accepted) revert BetNotActive();

        // Only creator or acceptor can check the bet
        require(
            msg.sender == bet.creator || msg.sender == bet.acceptor,
            "Only participants can check bet"
        );

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        // Set the API URL as an argument to the JavaScript code
        string[] memory args = new string[](1);
        args[0] = creatorApiURLs[_betId];
        req.setArgs(args);

        requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        requestIdToBetId[requestId] = _betId;
        emit OracleRequestSent(_betId, requestId);
    }

    /**
     * @notice Callback function for Chainlink Functions
     * @dev Automatically called by Chainlink Functions with the API response
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /* err */
    ) internal override {
        uint256 betId = requestIdToBetId[requestId];
        Bet storage bet = bets[betId];

        if (bet.status != BetStatus.Accepted) return;

        // Decode the response (expecting uint256)
        uint256 value = abi.decode(response, (uint256));
        uint256 adjustedValue = value / 100;

        address winner;
        uint256 totalPayout = bet.creatorAmount + bet.acceptorAmount;

        if (adjustedValue >= bet.targetValue) {
            winner = bet.creator;
        } else if (block.timestamp >= bet.expirationDate) {
            winner = bet.acceptor;
        } else {
            return;
        }

        bet.status = BetStatus.Resolved;
        bet.winner = winner;
        _removeFromAcceptedBets(betId);

        (bool success, ) = payable(winner).call{value: totalPayout}("");
        if (!success) revert TransferFailed();

        emit BetResolved(betId, winner, totalPayout);
    }

    /**
     * @notice Allows bet creator to cancel if not accepted by deadline
     * @param _betId The ID of the bet to cancel
     */
    function cancelExpiredBet(uint256 _betId) external nonReentrant {
        Bet storage bet = bets[_betId];

        require(bet.status == BetStatus.Active, "Bet not active");
        require(
            block.timestamp > bet.acceptByDate,
            "Accept deadline not passed"
        );
        require(msg.sender == bet.creator, "Only creator can cancel");

        bet.status = BetStatus.Cancelled;
        _removeFromActiveBets(_betId);

        (bool success, ) = bet.creator.call{value: bet.creatorAmount}("");
        if (!success) revert TransferFailed();

        emit BetCancelled(_betId, bet.creator, bet.creatorAmount);
    }

    // ============ Internal Helpers ============

    function _removeFromActiveBets(uint256 _betId) private {
        uint256 index = activeBetIndex[_betId];
        uint256 lastIndex = activeBetIds.length - 1;

        if (index != lastIndex) {
            uint256 lastBetId = activeBetIds[lastIndex];
            activeBetIds[index] = lastBetId;
            activeBetIndex[lastBetId] = index;
        }

        activeBetIds.pop();
        delete activeBetIndex[_betId];
    }

    function _removeFromAcceptedBets(uint256 _betId) private {
        uint256 index = acceptedBetIndex[_betId];
        uint256 lastIndex = acceptedBetIds.length - 1;

        if (index != lastIndex) {
            uint256 lastBetId = acceptedBetIds[lastIndex];
            acceptedBetIds[index] = lastBetId;
            acceptedBetIndex[lastBetId] = index;
        }

        acceptedBetIds.pop();
        delete acceptedBetIndex[_betId];
    }

    // ============ View Functions ============

    function getBet(uint256 _betId) external view returns (Bet memory) {
        return bets[_betId];
    }

    function getBetDetails(
        uint256 _betId
    )
        external
        view
        returns (
            Bet memory bet,
            string memory title,
            string memory creatorApi,
            string memory acceptorApi
        )
    {
        return (
            bets[_betId],
            betTitles[_betId],
            creatorApiURLs[_betId],
            acceptorApiURLs[_betId]
        );
    }

    function getActiveBets() external view returns (uint256[] memory) {
        return activeBetIds;
    }

    function getAcceptedBets() external view returns (uint256[] memory) {
        return acceptedBetIds;
    }

    function getUserBets(
        address _user
    ) external view returns (uint256[] memory) {
        return userBets[_user];
    }

    // ============ Emergency ============

    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    receive() external payable {}
}
