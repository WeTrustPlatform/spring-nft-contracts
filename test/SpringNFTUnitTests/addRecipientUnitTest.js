'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: addRecipient Unit Tests', function(accounts) {

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);
  });

  it('checks that proper values were updated', async function() {
    const recipientIdToTest = '0xbab'
    const recipientNameToTest = 'name'
    const recipientUrlToTest = 'url'
    const recipientOwnerAddressToTest = accounts[9]

    let recipient = await springNFTInstance.recipients.call(recipientIdToTest)
    assert.equal(recipient[4], false) // exists

    await springNFTInstance.addRecipient(
      recipientIdToTest,
      recipientNameToTest,
      recipientUrlToTest,
      recipientOwnerAddressToTest,
      {from: wetrustAddress})

    recipient = await springNFTInstance.recipients.call(recipientIdToTest)

    assert.equal(recipient[0], recipientNameToTest) // name
    assert.equal(recipient[1], recipientUrlToTest) // url
    assert.equal(recipient[2], recipientOwnerAddressToTest) // owner
    assert.equal(recipient[3], 0) // nftCount
    assert.equal(recipient[4], true) // exists
  });

  it('throw if not from wetrust address', async function() {
    // by default it'll be sent from non WeTrust address
    await utils.assertRevert(springNFTInstance.addRecipient('0x1', 'name', 'url', '0x0'))

    await springNFTInstance.addRecipient('0x1', 'name', 'url', '0x0', {from: wetrustAddress})
  });

  it('throw if recipient already exists', async function() {
    await springNFTInstance.addRecipient('0x1', 'name', 'url', '0x0', {from: wetrustAddress})

    await utils.assertRevert(springNFTInstance.addRecipient('0x1', 'name', 'url', '0x0'), {from: wetrustAddress})
  });

  it('throw if name of string is empty', async function() {
    await utils.assertRevert(springNFTInstance.addRecipient('0x1', '', 'url', '0x0'))

    await springNFTInstance.addRecipient('0x1', 'name', 'url', '0x0', {from: wetrustAddress})
  });

  it('throws if contract is in paused state', async function() {
    await springNFTInstance.setPaused(true, {from: managerAddress})
    await utils.assertRevert(springNFTInstance.addRecipient('0x1', 'name', 'url', '0x0', {from: wetrustAddress}))
  });
});
