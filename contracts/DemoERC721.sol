// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC4906.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC165.sol";

import "./libraries/Median.sol";

contract DemoERC721 is ERC721Enumerable, IERC4906 {
  using Median for Median.Data;

  error INSUFFICIENT_BALANCE();
  error INSUFFICIENT_VALUE_SENT();
  error INVALID_VALUE();
  error ONLY_TOKEN_OWNER();

  event MintBallotUpdate(uint256 indexed tokenId, uint256 oldValue, uint256 newValue);
  event FlagUpdate(uint256 indexed tokenId);

  Median.Data _mintBallots;
  uint256 public constant bucketIncrement = 0.1 ether;

  uint256 public mintCount;
  mapping(uint256 => uint256) public mintPrices;
  mapping(uint256 => uint256) public balanceClaimed;

  mapping(uint256 => string) _tokenURIs;
  mapping(uint256 => uint256) public flags;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {
    _mintBallots.bucketCount = 1001; // max 100 eth with 0.1 bucketIncrement
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
    return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
  }

  function mint(uint256 _mintBallot, uint256 flag, string memory _tokenURI) external payable {
    if(msg.value < currentMintPrice())
      revert INSUFFICIENT_VALUE_SENT();
    mintCount++;
    // You can pay more than the price
    mintPrices[mintCount] = msg.value;
    _mint(msg.sender, mintCount);
    setMintBallot(mintCount, _mintBallot);
    setFlag(mintCount, flag);
    setTokenURI(mintCount, _tokenURI);
  }

  // TODO should this be a median of recent history? twap?
  function currentMintPrice() public view returns(uint256) {
    return _mintBallots.calculate() * bucketIncrement;
  }

  function mintBallots(uint256 tokenId) public view returns(uint256) {
    return _mintBallots.ballots[tokenId];
  }

  function setMintBallot(uint256 tokenId, uint256 value) public {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();

    emit MintBallotUpdate(tokenId, _mintBallots.ballots[tokenId], value);

    _mintBallots.set(tokenId, value);
  }

  function setMintBallotMany(uint256[] memory tokenId, uint256 value) external {
    for(uint256 i = 0; i < tokenId.length; i++) {
      setMintBallot(tokenId[i], value);
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
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    if(claimableBalance(tokenId, untilTokenId) < amount)
      revert INSUFFICIENT_BALANCE();

    balanceClaimed[tokenId] += amount;
    recipient.transfer(amount);
  }

  function claimBalanceMany(
    uint256[] memory tokenId,
    uint256 untilTokenId,
    address payable recipient
  ) external {
    for(uint256 i = 0; i < tokenId.length; i++) {
      if(ownerOf(tokenId[i]) != msg.sender)
        revert ONLY_TOKEN_OWNER();
      uint256 amount = claimableBalance(tokenId[i], untilTokenId);
      balanceClaimed[tokenId[i]] += amount;
      recipient.transfer(amount);
    }
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    return _tokenURIs[tokenId];
  }

  function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();
    _tokenURIs[tokenId] = _tokenURI;
    emit MetadataUpdate(tokenId);
  }

  function setFlag(uint256 tokenId, uint256 flag) public {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();

    flags[tokenId] = flag;

    emit FlagUpdate(tokenId);
  }

  function setAll(
    uint256 tokenId,
    uint256 _mintBallot,
    uint256 flag,
    string memory _tokenURI
  ) public {
    if(ownerOf(tokenId) != msg.sender)
      revert ONLY_TOKEN_OWNER();

    setMintBallot(tokenId, _mintBallot);
    setFlag(tokenId, flag);
    setTokenURI(tokenId, _tokenURI);
  }

  function setAllMany(
    uint256[] memory tokenId,
    uint256 _mintBallot,
    uint256 flag,
    string memory _tokenURI
  ) external {
    for(uint256 i = 0; i < tokenId.length; i++) {
      setAll(tokenId[i], _mintBallot, flag, _tokenURI);
    }
  }

}
