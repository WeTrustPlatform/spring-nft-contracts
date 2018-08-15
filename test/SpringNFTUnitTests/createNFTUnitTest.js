'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: createNFT Unit Tests', function(accounts) {
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

  it('checks that proper values were updated', async function() {
    const traitsToAdd = '0x0000000000000000000000000000000000002345000000000000000000000000'
    const typeToAdd = '0x82000000'

    const tokenId = await springNFTInstance.createNFT.call(nftHolder, recipientId, traitsToAdd, typeToAdd, {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, traitsToAdd, typeToAdd, {from: wetrustAddress})
    const NFT = await springNFTInstance.nft.call(tokenId)

    assert.equal(NFT[0], nftHolder) //owner
    assert.equal(NFT[2], traitsToAdd) // traits
    assert.equal(NFT[4], typeToAdd) // type
    assert.equal(NFT[3], 0) // edition
  });

  it('throws if msg.sender is not wetrust', async function() {
    await utils.assertRevert(springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01'))
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('throws if recipient does not exist', async function() {
    await utils.assertRevert(springNFTInstance.createNFT(nftHolder, '0x2', '0x01', '0x01'))
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('throws if contract is in paused state', async function() {
    await springNFTInstance.setPaused(true, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress}))
  });
});
