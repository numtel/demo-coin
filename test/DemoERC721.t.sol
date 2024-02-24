// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {DemoERC721} from "../contracts/DemoERC721.sol";

contract DemoERC721Test is Test {
  error INSUFFICIENT_BALANCE();
  error INSUFFICIENT_VALUE_SENT();
  error INVALID_VALUE();
  error ONLY_TOKEN_OWNER();

  event MintBallotUpdate(uint256 indexed tokenId, uint256 oldValue, uint256 newValue);

  DemoERC721 public collection;

  function setUp() public {
    collection = new DemoERC721("Test", "TEST");
  }

  receive() external payable {}

  function test_Increment() public {
    // First nft is free
    collection.mint(0, 0, "");

    vm.prank(address(1));
    vm.expectRevert(ONLY_TOKEN_OWNER.selector);
    collection.setMintBallot(1, 10);

    vm.expectRevert(INVALID_VALUE.selector);
    collection.setMintBallot(1, 100000);

    vm.expectEmit();
    emit MintBallotUpdate(1, 0, 10);
    collection.setMintBallot(1, 10);
    assertEq(collection.currentMintPrice(), 1 ether);

    // Enough for many tests
    vm.deal(address(this), 10 ether);

    vm.expectRevert(INSUFFICIENT_VALUE_SENT.selector);
    collection.mint{value: 0.5 ether}(0, 0, "");

    assertEq(collection.claimableBalance(1, type(uint256).max), 0);
    collection.mint{value: 1 ether}(0, 0, "");
    assertEq(collection.claimableBalance(1, type(uint256).max), 1 ether);

    collection.mint{value: 1 ether}(0, 0, "");
    assertEq(collection.claimableBalance(1, type(uint256).max), 1.5 ether);
    assertEq(collection.claimableBalance(2, type(uint256).max), 0.5 ether);
    assertEq(collection.claimableBalance(3, type(uint256).max), 0 ether);

    collection.mint{value: 1 ether}(0, 0, "");
    assertEq(collection.claimableBalance(1, type(uint256).max), 1.833333333333333333 ether);
    assertEq(collection.claimableBalance(2, type(uint256).max), 0.833333333333333333 ether);
    assertEq(collection.claimableBalance(3, type(uint256).max), 0.333333333333333333 ether);
    assertEq(collection.claimableBalance(4, type(uint256).max), 0 ether);

    // Median is now 2 eth
    collection.setMintBallot(2, 30);

    vm.expectRevert(INSUFFICIENT_VALUE_SENT.selector);
    collection.mint{value: 1 ether}(0, 0, "");

    collection.mint{value: 2 ether}(0, 0, "");
    assertEq(collection.claimableBalance(1, type(uint256).max), 2.333333333333333333 ether);
    assertEq(collection.claimableBalance(2, type(uint256).max), 1.333333333333333333 ether);
    assertEq(collection.claimableBalance(3, type(uint256).max), 0.833333333333333333 ether);
    assertEq(collection.claimableBalance(4, type(uint256).max), 0.50 ether);

    vm.expectRevert(INSUFFICIENT_BALANCE.selector);
    collection.claimBalance(1, type(uint256).max, 3 ether, payable(address(this)));

    vm.prank(address(1));
    vm.expectRevert(ONLY_TOKEN_OWNER.selector);
    collection.claimBalance(1, type(uint256).max, 2 ether, payable(address(1)));

    // TODO test claiming until less than max tokenId
    uint256 balanceBefore = address(this).balance;
    collection.claimBalance(1, type(uint256).max, 2 ether, payable(address(this)));
    assertEq(address(this).balance - balanceBefore, 2 ether);

    uint256[] memory tokenIds = new uint256[](3);
    tokenIds[0] = 2;
    tokenIds[1] = 3;
    tokenIds[2] = 4;

    vm.prank(address(1));
    vm.expectRevert(ONLY_TOKEN_OWNER.selector);
    collection.claimBalanceMany(tokenIds, type(uint256).max, payable(address(1)));

    collection.claimBalanceMany(tokenIds, type(uint256).max, payable(address(this)));
    assertEq(address(this).balance - balanceBefore, 4.666666666666666666 ether);

    vm.prank(address(1));
    vm.expectRevert(ONLY_TOKEN_OWNER.selector);
    collection.setMintBallotMany(tokenIds, 50);

    collection.setMintBallotMany(tokenIds, 50);
    assertEq(collection.currentMintPrice(), 5 ether);
  }

  function testGas() public {
    for(uint256 i = 0; i<1000; i++) {
      uint256 mintPrice = collection.currentMintPrice();
      vm.deal(address(this), mintPrice);
      collection.mint{value:mintPrice}(0, 0, "");
      collection.setMintBallot(i+1, i+1);
    }
  }
}

