'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: getApproved Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    nftId = 1;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('returns correct approved address', async function() {
    const approvedAddress = accounts[2]
    await springNFTInstance.approve(approvedAddress, nftId)

    const approved = await springNFTInstance.getApproved.call(nftId)
    assert.equal(approved, approvedAddress)
  });

  it('throws if owner doesnt exists', async function() {
    await utils.assertRevert(springNFTInstance.getApproved.call(nftId + 1))

    await springNFTInstance.getApproved.call(nftId)
  });
});
