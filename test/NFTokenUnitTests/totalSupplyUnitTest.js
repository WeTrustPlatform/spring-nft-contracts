'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')
const consts = require('../utils/consts')

let springNFTInstance;

contract('NFToken: totalSupply Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1;

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})

  });

  it('checks that proper values were returned', async function() {
    let totalSupply = await springNFTInstance.totalSupply.call()
    assert.equal(totalSupply, 0)

    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})

    totalSupply = await springNFTInstance.totalSupply.call()
    assert.equal(totalSupply, 1)

    await springNFTInstance.createNFT(nftId + 1, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})

    totalSupply = await springNFTInstance.totalSupply.call()
    assert.equal(totalSupply, 2)
  });
});
