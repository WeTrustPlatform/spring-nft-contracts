'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: approve Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1
  let nftId2 = 2837

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId2, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values are returned', async function() {
    let tokenURI = await springNFTInstance.tokenURI.call(nftId);
    assert.equal(tokenURI, `https://spring.wetrust.io/shiba/${nftId}`)

    tokenURI = await springNFTInstance.tokenURI.call(nftId2);
    assert.equal(tokenURI, `https://spring.wetrust.io/shiba/${nftId2}`)
  });
});
