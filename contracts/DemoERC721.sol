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

  MedianLibrary.Data mintBallots;

  struct Ballot {
    uint256 timestamp;
    uint256 value;
  }

  mapping(uint256 => Ballot[]) public tokenMintBallots;

  uint256 public mintCount;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
    return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
  }

  function mint() external payable {
    if(msg.value < mintBallots.median())
      revert INSUFFICIENT_VALUE_SENT();
    mintCount++;
    _mint(msg.sender, mintCount);
  }

  function setMintBallot(uint256 tokenId, uint256 value) external {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    mintBallots.set(tokenId, value);
    tokenMintBallots[tokenId].push(Ballot(block.timestamp, value));
  }

}
