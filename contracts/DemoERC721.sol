// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC4906.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC165.sol";

contract DemoERC721 is ERC721Enumerable, IERC4906 {
  error INSUFFICIENT_BALANCE();
  error INSUFFICIENT_VALUE_SENT();
  error INVALID_VALUE();
  error ONLY_TOKEN_OWNER();
  error NO_CHANGE();

  event MintBallotSet(uint256 indexed tokenId, uint256 oldValue, uint256 newValue);

  mapping(uint256 => uint256) public mintBallots;
  mapping(uint256 => uint256) public medianBuckets;
  uint256 public constant bucketCount = 1001; // i.e. max 100 ether
  uint256 public constant bucketIncrement = 0.1 ether;
  uint256 public ballotCount;

  uint256 public mintCount;
  mapping(uint256 => uint256) public mintPrices;
  mapping(uint256 => uint256) public balanceClaimed;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
    return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
  }

  function mint() external payable {
    if(msg.value < currentMintPrice())
      revert INSUFFICIENT_VALUE_SENT();
    mintCount++;
    // You can pay more than the price
    mintPrices[mintCount] = msg.value;
    _mint(msg.sender, mintCount);
  }

  function currentMintPrice() public view returns(uint256) {
    // First time is free
    if(mintCount == 0) return 0;

    uint256 medianPos = ballotCount / 2;
    bool countIsEven = ballotCount % 2 == 0;
    uint256 soFar;
    uint256 curBucket;
    uint256 otherBucket;
    while(soFar <= medianPos) {
      soFar += medianBuckets[curBucket];
      curBucket++;
      if(countIsEven && soFar == medianPos && otherBucket == 0) {
        // Median is between 2 buckets
        otherBucket = curBucket;
      }
    }
    if(otherBucket > 0) {
      curBucket = (otherBucket + curBucket) / 2;
    }
    return curBucket * bucketIncrement;
  }

  function setMintBallot(uint256 tokenId, uint256 value) public {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    if(value > bucketCount)
      revert INVALID_VALUE();
    if(mintBallots[tokenId] == value)
      revert NO_CHANGE();

    emit MintBallotSet(tokenId, mintBallots[tokenId], value);

    if(mintBallots[tokenId] > 0) {
      // Updating an existing value
      medianBuckets[mintBallots[tokenId] - 1]--;
      mintBallots[tokenId] = 0;
      ballotCount--;
    }

    if(value > 0) {
      // Not clearing a token's vote
      medianBuckets[value - 1]++;
      mintBallots[tokenId] = value;
      ballotCount++;
    }
  }

  function claimableBalance(
    uint256 tokenId,
    uint256 untilTokenId
  ) public view returns (uint256 balance) {
    // Allow chunked claims to avoid block gas limit
    if(untilTokenId > mintCount) {
      untilTokenId = mintCount;
    }

    for(uint256 i = tokenId; i < untilTokenId; i++) {
      balance += mintPrices[i + 1] / i;
    }

    balance -= balanceClaimed[tokenId];
  }

  function claimBalance(
    uint256 tokenId,
    uint256 untilTokenId,
    uint256 amount,
    address payable recipient
  ) external {
    if(claimableBalance(tokenId, untilTokenId) < amount)
      revert INSUFFICIENT_BALANCE();

    balanceClaimed[tokenId] += amount;
    recipient.transfer(amount);
  }

}
