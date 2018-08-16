'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: approve Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  const nftHolder2 = accounts[2]
  let tokenId

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId = 1;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values are returned', async function() {
    await springNFTInstance.createNFT(nftHolder2, recipientId, '0x01', '0x01', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
    let tokenList = await springNFTInstance.getOwnedTokenList(nftHolder)

    assert.equal(tokenList.length, 2)
    assert.equal(tokenList[0], 1)
    assert.equal(tokenList[1], 3)

    const tokenToTransfer = 1
    await springNFTInstance.transferFrom(nftHolder, nftHolder2, tokenToTransfer)

    tokenList = await springNFTInstance.getOwnedTokenList(nftHolder)

    assert.equal(tokenList.length, 1)
    assert.equal(tokenList[0], 3)
  });
});
