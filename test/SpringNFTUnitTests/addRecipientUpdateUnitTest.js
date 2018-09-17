'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const abi = require('ethereumjs-abi')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: addRecipientUpdate Unit Tests', function(accounts) {
  const recipientId = '0x1'
  const recipientOwner = accounts[4]
  const nftHolder = accounts[0]
  let tokenId = 0

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    tokenId++;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', recipientOwner, {from: wetrustAddress})
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    const updateId = '0x'+ abi.rawEncode(['bytes32'], ['0xdeed']).toString('hex')
    await springNFTInstance.addRecipientUpdate(recipientId, updateId, {from: wetrustAddress})
    let update = await springNFTInstance.recipientUpdates.call(recipientId, 0)
    let updateCount = await springNFTInstance.getUpdateCount.call(recipientId)
    assert.equal(updateCount, 1)
    assert.equal(update[0], updateId)
  });

  it('throw if recipient does not exists', async function() {
    const updateId = '0xdeed'
    await utils.assertRevert(springNFTInstance.addRecipientUpdate(recipientId + '2', updateId, {from: wetrustAddress}))
    await springNFTInstance.addRecipientUpdate(recipientId, updateId, {from: wetrustAddress})
  });

  it('throw if msg.sender is not from wetrust or recipient', async function() {
    const updateId = '0xdeed'
    await utils.assertRevert(springNFTInstance.addRecipientUpdate(recipientId, updateId, {from: accounts[2]}))
    await springNFTInstance.addRecipientUpdate(recipientId, updateId, {from: recipientOwner})
  });

  it('throws if contract is in paused state', async function() {
    const updateId = '0xdeed'

    await springNFTInstance.setPaused(true, {from: managerAddress})
    await utils.assertRevert(springNFTInstance.addRecipientUpdate(recipientId, updateId, {from: recipientOwner}))
  });
});
