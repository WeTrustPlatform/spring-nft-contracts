'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: ownerOf Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let tokenId

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId = 1;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('returns correct owner', async function() {
    let owner = await springNFTInstance.ownerOf.call(tokenId);
    assert.equal(owner, nftHolder)

    const ownerToTest = accounts[2]

    tokenId++;
    await springNFTInstance.createNFT(ownerToTest, recipientId, '0x01', '0x01', {from: wetrustAddress})

    owner = await springNFTInstance.ownerOf.call(tokenId);
    assert.equal(owner, ownerToTest)
  });

  it('throws if owner doesnt exists', async function() {
    await utils.assertRevert(springNFTInstance.ownerOf.call(tokenId + 1))

    let owner = await springNFTInstance.ownerOf.call(tokenId);
    assert.equal(owner, nftHolder)
  });
});
