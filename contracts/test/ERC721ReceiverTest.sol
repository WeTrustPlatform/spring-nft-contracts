pragma solidity ^0.4.23;

import "../interface/ERC721TokenReceiver.sol";

contract ERC721ReceiverTest is ERC721TokenReceiver {

  event abitraryEvent(
    address indexed _operator, address indexed _from, uint256 _tokenId, bytes _data);

  function onERC721Received(
    address _operator, address _from, uint256 _tokenId, bytes _data) external returns (bytes4) {
    emit abitraryEvent(_operator, _from, _tokenId, _data);
    return 0x150b7a02;
  }
}
