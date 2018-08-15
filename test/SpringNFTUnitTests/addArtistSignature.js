'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: addArtistSingaure Unit Tests', function(accounts) {
  const artistSignature = '0xdeadbeef' // note, we don't need a real signature since smart contract doesn't validate the signer
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
    let signature = await springNFTInstance.nftArtistSignature(tokenId)
    assert.equal(signature, '0x')

    await springNFTInstance.addArtistSignature(tokenId, artistSignature, {from: wetrustAddress})

    signature = await springNFTInstance.nftArtistSignature(tokenId)
    assert.equal(signature, artistSignature)
  });

  it('throws if a signature already exist for the token', async function() {
    await springNFTInstance.addArtistSignature(tokenId, artistSignature, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.addArtistSignature(tokenId, artistSignature, {from: wetrustAddress}))
  });

  it('throws if contract is in paused state', async function() {
    await springNFTInstance.setPaused(true, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.addArtistSignature(tokenId, artistSignature, {from: wetrustAddress}))
  });
});
