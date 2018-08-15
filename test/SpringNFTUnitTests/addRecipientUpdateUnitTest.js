'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: addRecipientUpdate Unit Tests', function(accounts) {
  const recipientId = '0x1'
  const recipientOwner = accounts[4]
  const nftHolder = accounts[0]
  let tokenId = 0

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId++;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', recipientOwner, {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    const updateString = 'test'
    await springNFTInstance.addRecipientUpdate(recipientId, updateString, {from: wetrustAddress})
    let update = await springNFTInstance.recipientUpdates.call(recipientId, 0)
    assert.equal(update[0], updateString)
  });

  it('throw if recipient does not exists', async function() {
    const updateString = 'test'
    await utils.assertRevert(springNFTInstance.addRecipientUpdate(recipientId + '2', updateString, {from: wetrustAddress}))
    await springNFTInstance.addRecipientUpdate(recipientId, updateString, {from: wetrustAddress})
  });

  it('throw if msg.sender is not from wetrust or recipient', async function() {
    const updateString = 'test'
    await utils.assertRevert(springNFTInstance.addRecipientUpdate(recipientId, updateString, {from: accounts[2]}))
    await springNFTInstance.addRecipientUpdate(recipientId, updateString, {from: recipientOwner})
  });

  it('throws if contract is in paused state', async function() {
    const updateString = 'test'

    await springNFTInstance.setPaused(true, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.addRecipientUpdate(recipientId, updateString, {from: recipientOwner}))
  });
});
