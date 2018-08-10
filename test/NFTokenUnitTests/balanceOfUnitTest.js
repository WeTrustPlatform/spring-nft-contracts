'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: balanceOf Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let tokenId = 0

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId++;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('returns correct balance', async function() {
    let balance = await springNFTInstance.balanceOf.call(nftHolder)
    assert.equal(balance, 1)

    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})

    balance = await springNFTInstance.balanceOf.call(nftHolder)
    assert.equal(balance, 2)
  });

  it('throws if zero address is given', async function() {
    await utils.assertRevert(springNFTInstance.balanceOf.call('0x0'))

    await springNFTInstance.balanceOf.call(nftHolder)
  });
});
