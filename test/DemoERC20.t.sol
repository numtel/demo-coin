// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {DemoERC20} from "../contracts/DemoERC20.sol";

contract DemoERC20Test is Test {
  error InvalidValue();
  error InsufficientValueSent();

  DemoERC20 public token;

  function setUp() public {
    token = new DemoERC20("Test", "TEST");
  }

  receive() external payable {}

  function test_ballot() public {
    // Enough for many tests
    vm.deal(address(this), 10 ether);

    token.mint(address(this), 1e18);
    assertEq(token.currentMintPrice(), 0);

    vm.expectRevert(InvalidValue.selector);
    token.setMintBallot(1 ether);

    token.setMintBallot(1); // 0.001 eth per 1e18 minted
    assertEq(token.currentMintPrice(), 1e15);

    address SECOND = address(2);
    vm.deal(SECOND, 10 ether);
    vm.startPrank(SECOND);

    vm.expectRevert(InsufficientValueSent.selector);
    token.mint{value:0.00099 ether}(SECOND, 1e18);

    token.mint{value:0.001 ether}(SECOND, 1e18);
    assertEq(SECOND.balance, 10 ether - 0.001 ether);
    assertEq(token.balanceOf(SECOND), 1e18);

    assertEq(token.currentMintPrice(), 1e15);
    token.setMintBallot(3); // 0.003 eth per 1e18 minted
    assertEq(token.currentMintPrice(), 2e15); // Average of both account ballots

    vm.stopPrank();

    address THIRD = address(3);
    vm.deal(THIRD, 10 ether);
    vm.startPrank(THIRD);

    token.mint{value:0.002 ether}(THIRD, 1e18);
    token.setMintBallot(5);
    assertEq(token.currentMintPrice(), 3e15);

    vm.stopPrank();

    vm.expectRevert();
    token.burn(2e18);

    uint256 prevBalance = address(this).balance;
    token.burn(1e18);
    assertEq(token.balanceOf(address(this)), 0);
    assertEq(address(this).balance - prevBalance, 1e15);
    assertEq(address(token).balance, 2e15);
    assertEq(token.currentMintPrice(), 4e15);

    vm.prank(THIRD);
    token.burn(1e18);

    assertEq(address(token).balance, 1e15);
    assertEq(token.currentMintPrice(), 3e15);
  }
}

