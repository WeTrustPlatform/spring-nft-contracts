pragma solidity ^0.4.23;

import '../interface/ERC721.sol';
contract ERC721ReceiverTest {

    address from;
    address operator;
    uint256 tokenId;
    bytes data;
    bytes4 valueToReturnOnReceived;

    function setValueToReturnOnReceived (bytes4 value) public {
        valueToReturnOnReceived = value;
    }

    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes _data) external returns(bytes4) {
        operator = _operator;
        from = _from;
        tokenId = _tokenId;
        data = _data;

        return valueToReturnOnReceived;
    }
}
