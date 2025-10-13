// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title LinkToken
 * @notice Modern mock LINK token for local testing
 */
contract LinkToken is ERC20 {
    constructor() ERC20("ChainLink Token", "LINK") {
        // Mint 1 million LINK for testing
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    /**
     * @notice Transfer tokens and call recipient
     * @dev ERC-677 transferAndCall implementation (simplified for testing)
     */
    function transferAndCall(
        address to,
        uint256 value,
        bytes memory /* data */
    ) public returns (bool success) {
        transfer(to, value);
        // For testing, we don't need to call the recipient
        return true;
    }
}
