'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: ownerOf Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('returns correct owner', async function() {
    let owner = await springNFTInstance.ownerOf.call(nftId);
    assert.equal(owner, nftHolder)

    const ownerToTest = accounts[2]

    nftId++;
    await springNFTInstance.createNFT(nftId, ownerToTest, recipientId, '0x01', '0x01', {from: wetrustAddress})

    owner = await springNFTInstance.ownerOf.call(nftId);
    assert.equal(owner, ownerToTest)
  });

  it('throws if owner doesnt exists', async function() {
    await utils.assertRevert(springNFTInstance.ownerOf.call(nftId + 1))

    let owner = await springNFTInstance.ownerOf.call(nftId);
    assert.equal(owner, nftHolder)
  });
});
