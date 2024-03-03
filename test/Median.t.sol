// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {Median} from "../contracts/libraries/Median.sol";

contract Example {
  using Median for Median.Data;

  Median.Data data;

  constructor() {
    data.bucketCount = 1000;
  }

  function set(uint256 id, uint value) external {
    data.set(id,value);
  }
  function median() external view returns (uint) {
    return data.calculate();
  }
}

contract MedianLibraryTest is Test {
  Example data;

  function setUp() public {
    data = new Example();
  }

  function testBasic5() public {
    data.set(1, 1);
    data.set(2, 2);
    data.set(3, 4);
    data.set(4, 5);
    data.set(5, 9);
    assertEq(data.median(), 4);
  }

  function testBasic4() public {
    data.set(1, 1);
    data.set(2, 2);
    data.set(3, 4);
    data.set(4, 5);
    assertEq(data.median(), 3);
  }

  function testBasic3() public {
    data.set(1, 1);
    data.set(2, 2);
    data.set(4, 5);
    assertEq(data.median(), 2);
  }

  function testBasic2() public {
    data.set(1, 1);
    data.set(4, 7);
    assertEq(data.median(), 4);
  }

  function testBasic2_Update() public {
    data.set(1, 1);
    data.set(4, 7);
    assertEq(data.median(), 4);

    data.set(1, 11);
    assertEq(data.median(), 9);
  }

  function testBasic1() public {
    data.set(1, 1);
    assertEq(data.median(), 1);
  }

  function testMany(uint count) public {
    count = bound(count, 1, 100);
    count = 1000;

    for(uint i = 1; i < count + 1; i++) {
      data.set(i, i);
    }

    assertEq(data.median(), (count + 1) / 2);
  }

  function testBucket() public {
    data.set(1, 1);
    data.set(2, 1);
    data.set(3, 1);
    data.set(4, 4);
    data.set(5, 4);
    assertEq(data.median(), 1);
  }

  function testBucket2() public {
    data.set(1, 1);
    data.set(2, 1);
    data.set(3, 1);
    data.set(4, 3);
    data.set(5, 5);
    data.set(6, 6);
    data.set(7, 6);
    data.set(8, 7);
    assertEq(data.median(), 4);
  }

}

