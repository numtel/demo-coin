// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC4906.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC165.sol";
import "solidity-median-library/MedianLibrary.sol";

contract DemoERC721 is ERC721Enumerable, IERC4906 {
  using MedianLibrary for MedianLibrary.Data;

  error ONLY_TOKEN_OWNER();
  error INSUFFICIENT_VALUE_SENT();
  error INSUFFICIENT_BALANCE();

  event MintBallotSet(uint256 indexed tokenId, uint256 oldValue, uint256 newValue);

  MedianLibrary.Data mintBallots;

  uint256 public mintCount;
  mapping(uint256 => uint256) public mintPrices;
  mapping(uint256 => uint256) public balanceClaimed;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
    return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
  }

  function mint() external payable {
    if(msg.value < mintBallots.median())
      revert INSUFFICIENT_VALUE_SENT();
    mintCount++;
    mintPrices[mintCount] = msg.value;
    _mint(msg.sender, mintCount);
  }

  function currentMintPrice() external view returns(uint256) {
    return mintBallots.median();
  }

  function setMintBallot(uint256 tokenId, uint256 value) external {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    emit MintBallotSet(tokenId, mintBallots.values[tokenId], value);
    mintBallots.set(tokenId, value);
  }

  function claimableBalance(uint256 tokenId, uint256 untilTokenId) public view returns (uint256 balance) {
    // Allow chunked claims to avoid block gas limit
    if(untilTokenId > mintCount) {
      untilTokenId = mintCount;
    }

    for(uint256 i = tokenId; i < untilTokenId; i++) {
      balance += mintPrices[i + 1] / i;
    }

    balance -= balanceClaimed[tokenId];
  }

  function claimBalance(uint256 tokenId, uint256 untilTokenId, uint256 amount, address payable recipient) external {
    if(claimableBalance(tokenId, untilTokenId) < amount)
      revert INSUFFICIENT_BALANCE();

    balanceClaimed[tokenId] += amount;
    recipient.transfer(amount);
  }

}
