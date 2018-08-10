'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: updateRecipientInfo Unit Tests', function(accounts) {
  const recipientId = '0x1'
  const recipientOwner = accounts[4]
  let tokenId = 0

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId++;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', recipientOwner, {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    const recipientNameToTest = 'new name'
    const recipientUrlToTest = 'new url'
    const recipientOwnerAddressToTest = accounts[9]

    let recipient = await springNFTInstance.recipients.call(recipientId)
    assert.equal(recipient[0], 'name') // name
    assert.equal(recipient[1], 'url') // url
    assert.equal(recipient[2], recipientOwner) // owner
    assert.equal(recipient[3], 0) // nftCount
    assert.equal(recipient[4], true) // exists

    await springNFTInstance.updateRecipientInfo(
      recipientId,
      recipientNameToTest,
      recipientUrlToTest,
      recipientOwnerAddressToTest,
      {from: wetrustAddress})

    recipient = await springNFTInstance.recipients.call(recipientId)

    assert.equal(recipient[0], recipientNameToTest) // name
    assert.equal(recipient[1], recipientUrlToTest) // url
    assert.equal(recipient[2], recipientOwnerAddressToTest) // owner
    assert.equal(recipient[3], 0) // nftCount
    assert.equal(recipient[4], true) // exists
  });

  it('throw if not from wetrust address', async function() {
    // by default it'll be sent from non WeTrust address
    await utils.assertRevert(springNFTInstance.updateRecipientInfo('0x1', 'name', 'url', '0x0'))

    await springNFTInstance.updateRecipientInfo('0x1', 'name', 'url', '0x0', {from: wetrustAddress})
  });

  it('throw if recipient does not exists', async function() {
    await springNFTInstance.updateRecipientInfo('0x1', 'name', 'url', '0x0', {from: wetrustAddress})

    await utils.assertRevert(springNFTInstance.updateRecipientInfo('0x12', 'name', 'url', '0x0'), {from: wetrustAddress})
  });

  it('throw if name of string is empty', async function() {
    await utils.assertRevert(springNFTInstance.updateRecipientInfo('0x1', '', 'url', '0x0'))

    await springNFTInstance.updateRecipientInfo('0x1', 'name', 'url', '0x0', {from: wetrustAddress})
  });
});
