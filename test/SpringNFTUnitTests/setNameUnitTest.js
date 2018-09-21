'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: setName Unit Tests', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let tokenId = 0

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    tokenId++;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    let name = await springNFTInstance.name.call()
    assert.equal(name, 'Spring: Nifty Shiba')

    const nameToTest = 'new name'
    await springNFTInstance.setName(nameToTest, {from: managerAddress})

    name = await springNFTInstance.name.call()
    assert.equal(name, nameToTest)
  });

  it('throws if not called from wetrust manager address', async function() {
    const nameToTest = 'new name'
    await utils.assertRevert(springNFTInstance.setName(nameToTest, {from: wetrustAddress}))
    await springNFTInstance.setName(nameToTest, {from: managerAddress})
  });
});
