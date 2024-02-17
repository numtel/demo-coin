// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {DemoERC721} from "../contracts/DemoERC721.sol";

contract DemoERC721Test is Test {
  error ONLY_TOKEN_OWNER();
  error INSUFFICIENT_VALUE_SENT();

  DemoERC721 public collection;

  function setUp() public {
    collection = new DemoERC721("Test", "TEST");
  }

  function test_Increment() public {
    // First nft is free
    collection.mint();

    vm.prank(address(1));
    vm.expectRevert(ONLY_TOKEN_OWNER.selector);
    collection.setMintBallot(1, 1 ether);

    collection.setMintBallot(1, 1 ether);

    vm.deal(address(this), 1 ether);

    vm.expectRevert(INSUFFICIENT_VALUE_SENT.selector);
    collection.mint{value: 0.5 ether}();

    collection.mint{value: 1 ether}();
  }
}

