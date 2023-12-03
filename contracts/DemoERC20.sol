// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "solidity-median-library/MedianLibrary.sol";

contract DemoERC20 is ERC20 {
  using MedianLibrary for MedianLibrary.Data;

  MedianLibrary.Data ballots;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  function mint(uint256 value) external {
    _mint(msg.sender, value);
  }

  function setBallot(uint value) public {
    ballots.set(msg.sender, value);
  }
}
