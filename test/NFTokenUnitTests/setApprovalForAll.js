'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: setApprovalForAll Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  const nftId = 1

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);
    
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values are updated', async function() {
    const operatorToTest = accounts[2]
    await springNFTInstance.setApprovalForAll(operatorToTest, true, {from: nftHolder})

    const operator = await springNFTInstance.isApprovedForAll.call(nftHolder, operatorToTest)

    assert.equal(operator, true)
  });

  it('throws if operator is a zero address', async function() {
    const operatorToTest = accounts[2]

    await utils.assertRevert(springNFTInstance.setApprovalForAll('0x0', true, {from: nftHolder}))
    await springNFTInstance.setApprovalForAll(operatorToTest, true, {from: nftHolder})
  });

  it('checks that approvalForAll event is emitted', async function() {
    const operatorToTest = accounts[2]
    const res = await springNFTInstance.setApprovalForAll(operatorToTest, true, {from: nftHolder})
    assert.equal(res.logs[0].event, 'ApprovalForAll')
  });
});
