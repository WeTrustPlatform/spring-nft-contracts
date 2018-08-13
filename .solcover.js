module.exports = {
  port: 8555,
  testrpcOptions: '--port 8555 -m \"candy maple cake sugar pudding cream honey rich smooth crumble sweet treat\"',
  skipFiles: [
    'interface/ERC721.sol',
    'interface/ERC721Enumeration.sol',
    'interface/ERC721MetaData.sol',
    'interface/ERC721TokenReceiver.sol',
    'interface/SupportsInterface.sol',
    'test/ERC721ReceiverTest.sol',
    'utils/AddressUtils.sol'
  ]
};