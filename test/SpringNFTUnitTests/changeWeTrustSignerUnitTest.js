'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: changeWeTrustSigner Unit Tests', function(accounts) {
  let tokenId = 0

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    tokenId++;
  });

  it('checks that proper values were updated', async function() {
    let WeTrustAddress = await springNFTInstance.wetrustSigner.call();
    assert.equal(WeTrustAddress, wetrustAddress)

    const newWeTrustAddress = accounts[8]
    await springNFTInstance.changeWeTrustSigner(newWeTrustAddress, {from: managerAddress})

    WeTrustAddress = await springNFTInstance.wetrustSigner.call();
    assert.equal(WeTrustAddress, newWeTrustAddress)
  });

  it('throws if not from WeTrustAddress', async function() {
    const newWeTrustAddress = accounts[8]
    await utils.assertRevert(springNFTInstance.changeWeTrustSigner(newWeTrustAddress))
    await springNFTInstance.changeWeTrustSigner(newWeTrustAddress, {from: managerAddress})
  });

  it('throws if contract is in paused state', async function() {
    const newWeTrustAddress = accounts[8]
    await springNFTInstance.setPaused(true, {from: managerAddress})
    await utils.assertRevert(springNFTInstance.changeWeTrustSigner(newWeTrustAddress, {from: managerAddress}))
  });
});
