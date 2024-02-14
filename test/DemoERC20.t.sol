// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {DemoERC20} from "../contracts/DemoERC20.sol";

contract DemoERC20Test is Test {
  DemoERC20 public token;

  address mockOwner;

  function setUp() public {
    token = new DemoERC20("Test", "TEST");
  }

  function ownerOf(uint256) public view returns (address) {
    return mockOwner;
  }

  function test_Increment() public {
    token.registerRecipient(1);

    token.setRate(100);
    vm.warp(block.timestamp + token.RATE_INTERVAL());

    assertEq(token.tokenBalance(1), 100);

    token.setRate(200);
    assertEq(token.tokenBalance(1), 100);
    vm.warp(block.timestamp + token.RATE_INTERVAL());

    assertEq(token.tokenBalance(1), 300);

    token.setRate(300);
    vm.warp(block.timestamp + token.RATE_INTERVAL() * 2);
    assertEq(token.tokenBalance(1), 900);

    token.setRate(100);
    vm.warp(block.timestamp + token.RATE_INTERVAL());
    assertEq(token.tokenBalance(1), 1000);
  }
}
