// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract BetGame is ChainlinkClient, KeeperCompatibleInterface, Ownable{
    using Chainlink for Chainlink.Request;

    //Contract details
    uint256 public serviceFee;
    uint256 public minimumBet;
    address payable public devWallet;

    //Bet struct definition
    struct TimeProps {
        uint256 createdDate; // Date that the bet is posted on marketplace
        uint256 acceptByDate; //Date that the bet must be accepted by

        uint256 startDate; //Date that bet actually starts
        uint256 expirationDate; //Date that the bet expires

    }
    struct Bet {
        uint256 id;
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

    //##################################################################################

    // 1) CONTRACT DETAILS  LOGIC
    constructor(uint256 _minimumBet, uint256 _interval, address _link, address _oracle, bytes32 _jobId, uint256 _fee) {
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

    // 2) Bet logic
    function createBet(
        string memory _apiURL,
        uint256 _acceptValue,
        uint256 _countArts, uint256 _startdate, uint256 _endDate, uint256 _acceptdate
    ) public payable // uint256 _duration,
    // string memory _endDate
    {
        require(
            msg.value >= (minimumBet * .01 ether),
            "minimum bet not satisfied"
        );

        TimeProps memory _timeProps = TimeProps({
            createdDate: block.timestamp,
            acceptByDate: _acceptdate,
            startDate: _startdate,
            expirationDate: _endDate
        });

        Bet memory newBet = Bet({
            id: betId,
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

        betId++;
        activeBets.push(newBet.id);
        allBets[newBet.id] = newBet;
    }

    function acceptBet(uint256 _betId) public payable {
        Bet memory bet = allBets[_betId];
        require(bet.active == true, "bet not active");
        require(bet.accepted == false, "bet already accepted");
        require(bet.closed == false, "bet has been close");

        //should charge maintenence fee too
        require(
            (bet.acceptValue * .01 ether) == msg.value,
            "accepter money not correct"
        );

       // require(block.timestamp >= bet.acceptByDate, "Sorry the accept period for this bet has expired");

        // would take % for dev wallet
        bet.accepted = true;
        bet.amount += msg.value;
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
            removeBetFromArray(activeBets, _id);
            allBets[_id] = bet;
            removeBetFromArray(acceptedBets, _id);
        }
        else{
            if(block.timestamp >= bet.timeProps.expirationDate){
                bet.closed = true;
                bet.active = false;
                bet.acceptor.transfer(bet.amount);
                removeBetFromArray(activeBets, _id);
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
        betId = requestToBet[_requestId];
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
        //We can set a separate interval to clean active bets (right now it is every block which can get expensive)
        checkActiveBets();

        //Use this interval for the checkAcceptedBets (which will run the API)
        if ((block.timestamp - lastTimeStamp) > interval) {
            lastTimeStamp = block.timestamp;
            checkAcceptedBets();
        }
    }

    function checkAcceptedBets() private {
        //Check all accepted bets and checkBet if recently expired and still active (no manual bet check won)
        for(uint i = 0 ; i < acceptedBets.length; i++){
            Bet memory _currBet = allBets[acceptedBets[i]];
            if(_currBet.timeProps.expirationDate <= block.timestamp){
                checkBet(_currBet.id);
            }
        }
    }

    function checkActiveBets() private {
        //Cleans up any active bets that have expired without being accepted
        for(uint j = 0 ; j < activeBets.length; j++){
            Bet memory _currBet = allBets[activeBets[j]];
            if(!_currBet.accepted && _currBet.timeProps.acceptByDate <= block.timestamp){
                _currBet.active = false;
                removeBetFromArray(activeBets, _currBet.id);
            }
        }
    }
}