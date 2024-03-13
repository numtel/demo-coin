// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract DemoERC20 is ERC20Permit {
  uint256 public constant bucketIncrement = 0.001 ether;
  uint256 public constant bucketCount = 1001; // i.e. 1 eth (0-1000)
  mapping(uint256 => uint256) public buckets;
  mapping(address => uint256) public ballots;

  mapping(address account => uint256) private _balances;
  uint256 private _totalSupply;

  error InvalidValue();
  error InsufficientValueSent();

  constructor(string memory name, string memory symbol)
      ERC20Permit(name) ERC20(name, symbol) {}

  function decimals() public view virtual override returns (uint8) {
    return 18;
  }

  receive() external payable {}

  function currentMintPrice() public view returns(uint256) {
    uint256 totalBallots = _totalSupply - buckets[0];
    if(totalBallots == 0) return 0;

    uint256 medianPos = totalBallots / 2;
    bool countIsEven = totalBallots % 2 == 0;
    uint256 soFar;
    uint256 curBucket = 1;
    uint256 otherBucket;
    while(soFar <= medianPos) {
      soFar += buckets[curBucket];
      curBucket++;
      if(countIsEven && soFar == medianPos && otherBucket == 0) {
        // Median is between 2 buckets
        otherBucket = curBucket;
      }
    }
    if(otherBucket > 0) {
      curBucket = (otherBucket + curBucket) / 2;
    }
    return (curBucket - 1) * bucketIncrement;
  }

  function setMintBallot(uint256 value) public {
    if(value > bucketCount) revert InvalidValue();
    if(ballots[msg.sender] == value) return;

    uint256 balance = balanceOf(msg.sender);
    buckets[ballots[msg.sender]] -= balance;
    buckets[value] += balance;

    ballots[msg.sender] = value;
  }

  function mint(address account, uint256 value) public payable {
    if(msg.value < (value * currentMintPrice()) / 1e18) revert InsufficientValueSent();
    _mint(account, value);
  }

  function burn(uint256 value) public {
    payable(msg.sender).transfer(address(this).balance * value / _totalSupply);
    _burn(msg.sender, value);
  }

  function _update(address from, address to, uint256 value) internal virtual override {
      if (from == address(0)) {
          // Overflow check required: The rest of the code assumes that totalSupply never overflows
          _totalSupply += value;
      } else {
          uint256 fromBalance = _balances[from];
          if (fromBalance < value) {
              revert ERC20InsufficientBalance(from, fromBalance, value);
          }
          unchecked {
              // Overflow not possible: value <= fromBalance <= totalSupply.
              _balances[from] = fromBalance - value;
              buckets[ballots[from]] -= value;
          }
      }

      if (to == address(0)) {
          unchecked {
              // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
              _totalSupply -= value;
          }
      } else {
          unchecked {
              // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
              _balances[to] += value;
              buckets[ballots[to]] += value;
          }
      }

      emit Transfer(from, to, value);
  }

  function totalSupply() public view virtual override returns (uint256) {
      return _totalSupply;
  }

  function balanceOf(address account) public view virtual override returns (uint256) {
      return _balances[account];
  }
}
