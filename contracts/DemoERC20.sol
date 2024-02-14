// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract DemoERC20 is ERC20Permit, Ownable {
  error TOKEN_ALREADY_INITIALIZED();
  error INSUFFICIENT_MINT_AVAILABLE();
  error ONLY_TOKEN_OWNER();

  uint256 public constant RATE_INTERVAL = 60; // in seconds
  uint256 public currentRate; // tokens per 60 seconds per nft
  uint256 public startIndex;
  uint256 public startTime;

  mapping(uint256 => uint256) public tokenInitIndex;
  mapping(uint256 => uint256) public mintedByTokenId;

  constructor(string memory name, string memory symbol)
    ERC20Permit(name) ERC20(name, symbol) Ownable(msg.sender) {}

  function decimals() public view virtual override returns (uint8) {
    return 18;
  }

  function setRate(uint256 rate) external onlyOwner {
    startIndex = currentIndex();
    startTime = block.timestamp;
    currentRate = rate;
  }

  function currentIndex() public view returns (uint256) {
    return startIndex + currentRate * ((block.timestamp - startTime) / RATE_INTERVAL);
  }

  function registerRecipient(uint256 tokenId) external onlyOwner {
    if(tokenInitIndex[tokenId] != 0)
      revert TOKEN_ALREADY_INITIALIZED();

    tokenInitIndex[tokenId] = currentIndex();
  }

  function tokenBalance(uint256 tokenId) public view returns (uint256) {
    return currentIndex() - tokenInitIndex[tokenId] - mintedByTokenId[tokenId];
  }

  function mint(uint256 tokenId, uint256 amount, address recipient) external {
    if(IERC721(owner()).ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    if(tokenBalance(tokenId) < amount)
      revert INSUFFICIENT_MINT_AVAILABLE();
    mintedByTokenId[tokenId] += amount;
    _mint(recipient, amount);
  }
}
