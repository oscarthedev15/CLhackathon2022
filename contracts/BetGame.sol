// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

// import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract BetGame is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    //  using Chainlink for Chainlink.Request;

  //  uint256 public volume;

    //Contract details
    address public owner;
    uint256 public serviceFee;
    uint256 public minimumBet;
    address payable public devWallet;

    //Bet struct definition
    struct Bet {
        uint256 id;
        address payable creator;
        address payable acceptor;
        string apiURL;
        uint256 ammount;
        uint256 acceptValue;
        bool accepted;
        bool active;
        bool closed;
        uint256 countArts;
        // uint256 createdDate;
        // uint256 activeDuration;
        // uint256 acceptedDuration;
        // string expirationDate;
    }
    uint256 betId = 0;
    mapping(uint256 => Bet) public allBets;
    uint256[] public activeBets;
    uint256[] public acceptedBets;

    //Oracle Attributes
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    mapping(bytes32 => uint256) private requestToBet;

    //Keepers Attributes
    uint256 public immutable interval;
    uint256 public lastTimeStamp;
    uint256 public counter;
    bool public active = true;

    //##################################################################################

    // 1) CONTRACT DETAILS  LOGIC
    constructor(uint256 _minimumBet, uint256 _interval) {
        owner = msg.sender;
        minimumBet = _minimumBet;
        interval = _interval;
        lastTimeStamp = block.timestamp;
    }

    modifier restricted() {
        require(msg.sender == owner, "only owner can call function");
        _;
    }

    function setDevWallet(address payable _devWallet) external restricted {
        devWallet = _devWallet;
    }

    function setMinimumBet(uint256 _minimumBet) external restricted {
        minimumBet = _minimumBet;
    }

    // 2) Bet logic
    function createBet(
        string memory _apiURL,
        uint256 _acceptValue,
        uint256 _countArts
    ) public payable // uint256 _duration,
    // string memory _endDate
    {
        require(
            msg.value >= (minimumBet * .01 ether),
            "minimum bet not satisfied"
        );
        Bet memory newBet = Bet({
            id: betId,
            creator: payable(msg.sender),
            acceptor: payable(address(0)),
            apiURL: _apiURL,
            ammount: msg.value,
            acceptValue: _acceptValue,
            accepted: false,
            active: true,
            closed: false,
            countArts: _countArts
            // createdDate: block.timestamp,
            // duration: _duration,
            // expiration: _endDate
        });
        betId++;
        activeBets.push(newBet.id);
        allBets[newBet.id] = newBet;
    }

    function acceptBet(uint256 _betId) public payable {
        Bet memory bet = allBets[_betId];
        require(bet.active == true, "bet not active");
        require(bet.accepted == false, "bet already accepted");

        //should charge maintenence fee too
        require(
            (bet.acceptValue * .01 ether) == msg.value,
            "accepter money not correct"
        );

        // would take % for dev wallet
        bet.accepted = true;
        bet.ammount += msg.value;
        bet.acceptor = payable(msg.sender);
        removeBetFromArray(activeBets, bet.id);
        allBets[bet.id] = bet;
        acceptedBets.push(bet.id);
    }

    function removeBetFromArray(uint256[] storage _arr, uint256 _id) internal {
        for (uint256 i = 0; i < _arr.length; i++) {
            if (_arr[i] == _id) {
                delete _arr[i];
                _arr[i] = _arr[_arr.length - 1];
                _arr.pop();
            }
        }
    }

    function checkBet(uint256 _id) public {
        queryOracle(_id);
    }

    function recieveResult(uint256 _id, uint256 _value) internal {
        Bet memory bet = allBets[_id];
        if (_value > bet.countArts) {
            bet.closed = true;
            bet.creator.transfer(bet.ammount);
            removeBetFromArray(activeBets, _id);
            allBets[_id] = bet;
            removeBetFromArray(acceptedBets, _id);
        }
    }

    function fulfill(bytes32 _requestId, uint256 _volume)
        public
        recordChainlinkFulfillment(_requestId)
    {
        uint256 temp_volume = _volume / 100;
      //  volume = temp_volume;
        betId = requestToBet[_requestId];
        recieveResult(betId, temp_volume);
    }

    // 3) ORACLE LOGIC
    function queryOracle(uint256 _id) internal {
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10**18; // (Varies by network and job)
        Bet memory bet = allBets[_id];
        requestVolumeData(bet.apiURL, _id);
    }

    function requestVolumeData(string memory _apiURL, uint256 _id)
        public
        returns (bytes32 requestId)
    {
        Chainlink.Request memory request = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        // Set the URL to perform the GET request on
        request.add("get", _apiURL);
        request.add("path", "totalResults"); // Chainlink nodes 1.0.0 and later support this format
        requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestToBet[requestId] = _id;
        return requestId;
    }
}