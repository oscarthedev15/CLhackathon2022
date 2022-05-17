pragma solidity ^0.8.7;

contract BetFactory {
    Bet[] public deployedBets;

    function createBet(string memory title, uint bet, uint acceptBy, uint expiration) public {
        Bet newBet = new Bet(title, bet, acceptBy, expiration, msg.sender);
        deployedBets.push(newBet);
    }

    function getDeployedBets() public view returns (Bet[] memory) {
        return deployedBets;
    }
}

contract Bet {
    // may not need all of these, just how I thought of breaking down a bet
    address payable public bettor;
    address payable public taker;
    bool public bettorWon;
    string public title;
    bool public active;
    bool public accepted;
    uint public betAmount;
    uint public creationDate;       // no DateTime types in Solidity
    uint public acceptByDate;
    uint public expirationDate;
    string[] public keywords;       // would this be inputted by user?

    constructor(string memory _title, uint _bet, uint _acceptBy, uint _expiration, address _owner) {
        bettor = payable(_owner);
        title = _title;
        betAmount = _bet;
        acceptByDate = _acceptBy;
        expirationDate = _expiration;
        active = true;
        // need to get creationDate somehow
    }

    function checkBetStatus() public {
        // checks whether the bet has been won, if it is active and has been accepted
        // flags winner and sends funds
        // incorporate Keeper and AnyAPI here
    }

    function acceptBet() public {
        // if bet is not already accepted and is active, allows caller to accept bet
        // caller who accepts = the taker
        // not sure I am clear on where the bet money goes here? 
    }
}