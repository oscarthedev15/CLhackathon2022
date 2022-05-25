// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface KeeperRegistryInterface {

  function cancelUpkeep(uint256 id) external;

  function addFunds(uint256 id, uint96 amount) external;
}

