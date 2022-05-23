pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract BetGame is ChainlinkClient, KeeperCompatibleInterface, Ownable {
    using Chainlink for Chainlink.Request;

    //Contract details
    uint256 public serviceFee;
    uint256 public minimumBet;
    address payable public devWallet;

    //Bet struct definition
    struct TimeProps {
        uint256 createdDate; // Date that the bet is posted on marketplace
        uint256 acceptByDate; //Date that the bet must be accepted by
        uint256 startDate; //Date that bet was actually accepted
        uint256 expirationDate; //Date that the bet expires
    }
    struct Bet {
        uint256 id;
        string title;
        address payable creator;
        address payable acceptor;
        string apiURL;
        uint256 amount;
        uint256 acceptValue;
        bool accepted;
        bool active;
        bool closed;
        uint256 countArts;
        TimeProps timeProps;
    }

    uint256 public globalId;
    mapping(uint256 => Bet) public allBets;
    uint256[] public activeBets;
    uint256[] public acceptedBets;

    //Oracle Attributes
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    mapping(bytes32 => uint256) private requestToBet;

    //Keepers Attributes
    KeeperRegistry public keeperRegistry;
    uint256 public interval;
    uint256 public lastTimeStamp;
    uint256 public keeperJobId;

    //Eth -> Link Swap Attributes
    ISwapRouter public swapRouter;
    address public weth;
    uint24 public constant poolFee = 3000;

    //5. Functions  for converting ETH to LINK

    //Get the Chainlink Balance
    function getLinkBalance() public view returns (uint256) {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        return link.balanceOf(address(this));
    }

    function setWETHAddress(address _weth) public onlyOwner {
        weth = _weth;
    }

    /// @notice swapExactInputSingle swaps a fixed amount of WETH for a maximum possible amount of LINK
    /// using the DAI/WETH9 0.3% pool by calling `exactInputSingle` in the swap router.
    /// @dev The calling address must approve this contract to spend at least `amountIn` worth of its DAI for this function to succeed.
    /// @param amountIn The exact amount of WETH that will be swapped for LINK.
    /// @return amountOut The amount of LINK received.
    function swapExactInputSingle(uint256 amountIn)
        public
        returns (uint256 amountOut)
    {
        // msg.sender must approve this contract

        // Transfer the specified amount of  to this contract.

        // Approve the router to spend ETH.
        TransferHelper.safeApprove(weth, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: weth,
                tokenOut: chainlinkTokenAddress(),
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    //convert Eth from this contract to Chainlink
    function convertEthToLink(uint256 _eth) private returns (uint256) {
        uint256 amountOut = swapExactInputSingle(_eth);
        return amountOut;
    }

    //##################################################################################

    // 1) CONTRACT DETAILS  LOGIC
    constructor(
        uint256 _minimumBet,
        uint256 _interval,
        address _link,
        address _oracle,
        bytes32 _jobId,
        uint256 _fee
    ) {
        //owner = msg.sender;
        minimumBet = _minimumBet;
        interval = _interval;
        lastTimeStamp = block.timestamp;

        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;
    }

    function setDevWallet(address payable _devWallet) external onlyOwner {
        devWallet = _devWallet;
    }

    function setMinimumBet(uint256 _minimumBet) external onlyOwner {
        minimumBet = _minimumBet;
    }

    function setJobId(bytes32 _jobId) external onlyOwner {
        jobId = _jobId;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
        fee = 0.1 * 10**18;
    }

    function setInterval(uint256 _interval) external onlyOwner {
        interval = _interval;
    }

    function getActiveBets() public view returns (uint256[] memory) {
        return activeBets;
    }

    function getAcceptedBets() public view returns (uint256[] memory) {
        return acceptedBets;

    } 
    function getEthBalance() public view returns(uint256){
        return address(this).balance;
    }

    //Service Fee setters and getters for the bet service fee
    function setLinkServiceFee(uint256 _eth) external onlyOwner {
        serviceFee = _eth;
    }

    function setUpkeepCost(uint256 cost) public onlyOwner{
        serviceFee = cost;
    }

    function getUpkeepCost() external view returns (uint256) {
        return serviceFee;
    }

    function setKeeperRegistry(address _add) public onlyOwner {
        keeperRegistry = KeeperRegistry(_add);
    }

    function setKeeperJob(uint256 jobId) public onlyOwner {
        keeperJobId = jobId;
    }

    //Funds keeper taking in a uint256 for amount of ETH to be converted
    function fundKeeper(uint256 _ethamount) public payable {
        uint256 amount = convertEthToLink(_ethamount);
        keeperRegistry.addFunds(keeperJobId, uint96(amount));
    }

    // 2) Bet logic
    function createBet(
        string memory _apiURL,
        uint256 _acceptValue,
        uint256 _countArts,
        uint256 _endDate,
        uint256 _acceptdate,
        string memory _title // uint256 _duration, // string memory _endDate
    ) public payable {
        require(msg.value >= (minimumBet), "minimum bet not satisfied");

        require(
            _acceptValue >= (minimumBet),
            "minimum bet not satisfied for accept value"
        );

        require(
            (_acceptdate < _endDate),
            "accept date must be before end date"
        );

        TimeProps memory _timeProps = TimeProps({
            createdDate: block.timestamp,
            acceptByDate: _acceptdate,
            startDate: 0,
            expirationDate: _endDate
        });

        Bet memory newBet = Bet({
            id: globalId,
            title: _title,
            creator: payable(msg.sender),
            acceptor: payable(address(0)),
            apiURL: _apiURL,
            amount: msg.value,
            acceptValue: _acceptValue,
            accepted: false,
            active: true,
            closed: false,
            countArts: _countArts,
            timeProps: _timeProps
        });

        globalId = globalId + 1;
        activeBets.push(newBet.id);
        allBets[newBet.id] = newBet;
        // fundKeeper(serviceFee);
    }

    function acceptBet(uint256 _betId, string memory _apiURL) public payable {
        Bet memory bet = allBets[_betId];
        require(bet.active == true, "bet not active");
        require(bet.accepted == false, "bet already accepted");
        require(bet.closed == false, "bet has been closed");

        //should charge maintenence fee too
        require((bet.acceptValue) == msg.value, "accepter money not correct");

        require(
            block.timestamp <= bet.timeProps.acceptByDate,
            "bet is no longer open for accepting"
        );

        // would take % for dev wallet
        bet.timeProps.startDate = block.timestamp;
        bet.accepted = true;
        bet.apiURL = _apiURL;
        bet.amount += msg.value;
        bet.acceptor = payable(msg.sender);
        removeBetFromArray(activeBets, bet.id);
        allBets[bet.id] = bet;
        acceptedBets.push(bet.id);

        //fund the keeper registy
        fundKeeper(serviceFee);
    }

    function removeBetFromArray(uint256[] storage _arr, uint256 _id) internal {
        for (uint256 i = 0; i < _arr.length; i++) {
            if (_arr[i] == _id) {
                delete _arr[i];
                _arr[i] = _arr[_arr.length - 1];
                _arr.pop();
                break;
            }
        }
    }

    function checkBet(uint256 _id) public {
        // setPublicChainlinkToken();
        Bet memory bet = allBets[_id];
        requestVolumeData(bet.apiURL, _id);
    }

    function recieveResult(uint256 _id, uint256 _value) internal {
        Bet memory bet = allBets[_id];
        if (_value > bet.countArts) {
            bet.closed = true;
            bet.active = false;
            bet.creator.transfer(bet.amount);
            allBets[_id] = bet;
            removeBetFromArray(acceptedBets, _id);
        } else {
            if (block.timestamp >= bet.timeProps.expirationDate) {
                bet.closed = true;
                bet.active = false;
                bet.acceptor.transfer(bet.amount);
                allBets[_id] = bet;
                removeBetFromArray(acceptedBets, _id);
            }
        }
    }

    function fulfill(bytes32 _requestId, uint256 _volume)
        public
        recordChainlinkFulfillment(_requestId)
    {
        uint256 temp_volume = _volume / 100;
        uint256 betId = requestToBet[_requestId];
        // Bet memory bet = allBets[betId];
        // bet.acceptValue = _volume;
        // allBets[betId] = bet;
        recieveResult(betId, temp_volume);
    }

    //  3) ORACLE LOGIC

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

    //    4) Keeper component
    //    4) Keeper component
    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = ((block.timestamp - lastTimeStamp) > interval);
        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external override {
        //Use this interval for the checkAcceptedBets (which will run the API)
        // if ((block.timestamp - lastTimeStamp) > interval) {
        //     lastTimeStamp = block.timestamp;
        //     checkActiveBets();
        //     checkAcceptedBets();
        // }
        require(
            (block.timestamp - lastTimeStamp) > interval,
            "Time interval not met"
        );
        lastTimeStamp = block.timestamp;
        checkActiveBets();
        checkAcceptedBets();
    }

    function checkAcceptedBets() private {
        //Check all accepted bets and checkBet if recently expired and still active (no manual bet check won)
        for (uint256 i = 0; i < acceptedBets.length; i++) {
            Bet memory _currBet = allBets[acceptedBets[i]];
            if (_currBet.timeProps.expirationDate <= block.timestamp) {
                checkBet(_currBet.id);
            }
        }
    }

    function checkActiveBets() private {
        //Cleans up any active bets that have expired without being accepted
        for (uint256 j = 0; j < activeBets.length; j++) {
            Bet memory _currBet = allBets[activeBets[j]];
            if (
                !_currBet.accepted &&
                _currBet.timeProps.acceptByDate <= block.timestamp
            ) {
                _currBet.active = false;
                removeBetFromArray(activeBets, _currBet.id);
            }
        }
    }
}

interface KeeperRegistry{
    function addFunds(uint256 id, uint96 amount) external;
}
