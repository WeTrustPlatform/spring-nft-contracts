'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: tokenByIndex Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1;

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were returned', async function() {
    let tokenId = await springNFTInstance.tokenByIndex.call(0)
    assert.equal(tokenId, nftId)

    nftId = 287423
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})

    tokenId = await springNFTInstance.tokenByIndex.call(1)
    assert.equal(tokenId, nftId)
  });

  it('throws if index is greater than or equal to totalSupply', async function() {
    let totalSupply = await springNFTInstance.totalSupply.call()
    await utils.assertRevert(springNFTInstance.tokenByIndex.call(totalSupply))
    await utils.assertRevert(springNFTInstance.tokenByIndex.call(totalSupply + 1))
    await springNFTInstance.tokenByIndex.call(totalSupply - 1)
  });
});
