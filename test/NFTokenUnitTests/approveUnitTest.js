'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: approve Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values are updated', async function() {
    const approvedAddress = accounts[2]
    await springNFTInstance.approve(approvedAddress, nftId)

    const approved = await springNFTInstance.getApproved.call(nftId)
    assert.equal(approved, approvedAddress)
  });

  it('throw if msg.sender doesnt have permission to approve', async function() {
    const approvedAddress = accounts[2]
    await utils.assertRevert(springNFTInstance.approve(approvedAddress, nftId, {from: wetrustAddress}))
    await springNFTInstance.approve(approvedAddress, nftId)
  });

  it('throw if owner doesnt exist for tokenId', async function() {
    const approvedAddress = accounts[2]
    await utils.assertRevert(springNFTInstance.approve(approvedAddress, nftId + 1))
    await springNFTInstance.approve(approvedAddress, nftId)
  });

  it('throw if approved address is token owner', async function() {
    const approvedAddress = accounts[2]
    await utils.assertRevert(springNFTInstance.approve(nftHolder, nftId))

    await springNFTInstance.approve(approvedAddress, nftId)
  });

  it('checks that approval event is emitted', async function() {
    const approvedAddress = accounts[2]
    const res = await springNFTInstance.approve(approvedAddress, nftId)
    assert.equal(res.logs[0].event, 'Approval')
  });
});
