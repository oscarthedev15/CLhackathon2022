// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

/**
 * @title MockOracle
 * @notice Modern mock Chainlink oracle for local testing
 */
contract MockOracle {
    LinkTokenInterface public immutable linkToken;

    event OracleRequest(
        bytes32 indexed requestId,
        address indexed requester,
        bytes32 jobId,
        uint256 payment
    );

    constructor(address _linkToken) {
        linkToken = LinkTokenInterface(_linkToken);
    }

    /**
     * @notice Called when LINK is sent to the contract
     */
    function onTokenTransfer(
        address sender,
        uint256 amount,
        bytes memory data
    ) public returns (bool) {
        require(msg.sender == address(linkToken), "Must use LINK token");

        // Just accept the LINK, actual request handling is done in tests
        return true;
    }

    /**
     * @notice Manually fulfill an oracle request (for testing)
     */
    function fulfillOracleRequest(bytes32 requestId, uint256 data) public {
        // In tests, we'll call the callback directly on the consumer contract
        // This is extracted from the request and called manually in tests
    }
}
