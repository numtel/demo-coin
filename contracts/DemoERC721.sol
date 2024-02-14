// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "solidity-median-library/MedianLibrary.sol";

import "./DemoERC20.sol";

contract DemoERC721 is ERC721 {
  using MedianLibrary for MedianLibrary.Data;

  error ONLY_TOKEN_OWNER();

  DemoERC20 public coin;
  MedianLibrary.Data emissionBallots;
  MedianLibrary.Data mintBallots;

  constructor(
    string memory name,
    string memory symbol,
    string memory coinName,
    string memory coinSymbol
  ) ERC721(name, symbol) {
    coin = new DemoERC20(coinName, coinSymbol);
  }

  // TODO mintWithPermit()
  function mint(uint256 tokenId) external {
    coin.transferFrom(msg.sender, address(this), mintBallots.median());
    coin.registerRecipient(tokenId);
    _mint(msg.sender, tokenId);
  }

  function setEmissionBallot(uint256 tokenId, uint256 value) external {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    emissionBallots.set(tokenId, value);
    coin.setRate(emissionBallots.median());
  }

  function setMintBallot(uint256 tokenId, uint256 value) external {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    mintBallots.set(tokenId, value);
  }

}
