'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: changeWeTrustAddress Unit Tests', function(accounts) {
  let tokenId = 0

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId++;
  });

  it('checks that proper values were updated', async function() {
    let WeTrustAddress = await springNFTInstance.wetrustAddress.call();
    assert.equal(WeTrustAddress, wetrustAddress)

    const newWeTrustAddress = accounts[8]
    await springNFTInstance.changeWeTrustAddress(newWeTrustAddress, {from: wetrustAddress})

    WeTrustAddress = await springNFTInstance.wetrustAddress.call();
    assert.equal(WeTrustAddress, newWeTrustAddress)
  });

  it('throws if not from WeTrustAddress', async function() {
    const newWeTrustAddress = accounts[8]
    await utils.assertRevert(springNFTInstance.changeWeTrustAddress(newWeTrustAddress))
    await springNFTInstance.changeWeTrustAddress(newWeTrustAddress, {from: wetrustAddress})
  });

  it('throws if contract is in paused state', async function() {
    const newWeTrustAddress = accounts[8]
    await springNFTInstance.setPaused(true, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.changeWeTrustAddress(newWeTrustAddress, {from: wetrustAddress}))
  });
});
