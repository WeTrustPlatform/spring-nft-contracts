'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: isApprovedForAll Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  const operatorToTest = accounts[2]
  let tokenId

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId = 1;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
    await springNFTInstance.setApprovalForAll(operatorToTest, true, {from: nftHolder})

  });

  it('returns correct operator', async function() {
    const operator = await springNFTInstance.isApprovedForAll.call(nftHolder, operatorToTest)

    assert.equal(operator, true)
  });

  it('throws if owner is zero address', async function() {
    await utils.assertRevert(springNFTInstance.isApprovedForAll.call(nftHolder, '0x0'))
    const operator = await springNFTInstance.isApprovedForAll.call(nftHolder, operatorToTest)

    assert.equal(operator, true)

  });

  it('throws if operator is zero address', async function() {
    await utils.assertRevert(springNFTInstance.isApprovedForAll.call('0x0', operatorToTest))
    const operator = await springNFTInstance.isApprovedForAll.call(nftHolder, operatorToTest)

    assert.equal(operator, true)
  });
});
