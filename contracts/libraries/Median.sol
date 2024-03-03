// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library Median {
  error INVALID_VALUE();

  struct Data {
    uint256 count; // Total number of ballots
    uint256 bucketCount;
    mapping(uint256 => uint256) buckets;
    mapping(uint256 => uint256) ballots;
  }

  function set(Data storage self, uint256 tokenId, uint256 value) internal {
    if(value > self.bucketCount)
      revert INVALID_VALUE();

    if(self.ballots[tokenId] > 0) {
      // Updating an existing value
      self.buckets[self.ballots[tokenId] - 1]--;
      self.ballots[tokenId] = 0;
      self.count--;
    }

    if(value > 0) {
      // Not clearing a token's vote
      self.buckets[value - 1]++;
      self.ballots[tokenId] = value;
      self.count++;
    }
  }

  function calculate(Data storage self) internal view returns(uint256) {
    if(self.count == 0) return 0;

    uint256 medianPos = self.count / 2;
    bool countIsEven = self.count % 2 == 0;
    uint256 soFar;
    uint256 curBucket;
    uint256 otherBucket;
    while(soFar <= medianPos) {
      soFar += self.buckets[curBucket];
      curBucket++;
      if(countIsEven && soFar == medianPos && otherBucket == 0) {
        // Median is between 2 buckets
        otherBucket = curBucket;
      }
    }
    if(otherBucket > 0) {
      curBucket = (otherBucket + curBucket) / 2;
    }
    return curBucket;
  }
}
