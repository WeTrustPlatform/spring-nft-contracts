'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: setSymbol Unit Tests', function(accounts) {
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
    let symbol = await springNFTInstance.symbol.call()
    assert.equal(symbol, 'SPRN')

    const symbolToTest = 'new symbol'
    await springNFTInstance.setSymbol(symbolToTest, {from: managerAddress})

    symbol = await springNFTInstance.symbol.call()
    assert.equal(symbol, symbolToTest)
  });

  it('throws if not called from wetrust manager address', async function() {
    const symbolToTest = 'new symbol'
    await utils.assertRevert(springNFTInstance.setSymbol(symbolToTest, {from: wetrustAddress}))
    await springNFTInstance.setSymbol(symbolToTest, {from: managerAddress})
  });
});
