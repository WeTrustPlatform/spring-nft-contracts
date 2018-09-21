'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')
const consts = require('../utils/consts')

let springNFTInstance;

contract('NFToken: tokenOfOwnerByIndex Unit Test', function(accounts) {
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

  it('checks that proper values were updated', async function() {
    let tokenId = await springNFTInstance.tokenOfOwnerByIndex.call(nftHolder, 0)
    assert.equal(tokenId, nftId)

    nftId = 287423
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})

    tokenId = await springNFTInstance.tokenOfOwnerByIndex.call(nftHolder, 1)
    assert.equal(tokenId, nftId)
  });

  it('throw if owner address is zero address', async function() {
    await utils.assertRevert(springNFTInstance.tokenOfOwnerByIndex.call(consts.ZERO_ADDRESS, 0))
    await springNFTInstance.tokenOfOwnerByIndex.call(nftHolder, 0)
  });

  it('throw if index is greater than or equal to balanceOf owner', async function() {
    const ownerBalance = await springNFTInstance.balanceOf(nftHolder)
    await utils.assertRevert(springNFTInstance.tokenOfOwnerByIndex.call(nftHolder, ownerBalance))
    await springNFTInstance.tokenOfOwnerByIndex.call(nftHolder, ownerBalance - 1)
  });
});
