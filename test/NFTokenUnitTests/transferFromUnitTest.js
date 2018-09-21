'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')
const consts = require('../utils/consts')

let springNFTInstance;

contract('NFToken: transferFrom Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1;

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    let totalSupply = await springNFTInstance.totalSupply.call()
    assert.equal(totalSupply, 1)

    const newNFTHolder = accounts[3]
    let owner = await springNFTInstance.ownerOf.call(nftId)
    assert.equal(owner, nftHolder)

    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)

    owner = await springNFTInstance.ownerOf.call(nftId)
    assert.equal(owner, newNFTHolder)

    totalSupply = await springNFTInstance.totalSupply.call()
    assert.equal(totalSupply, 1)
  });

  it('checks that approval is removed when token is transferred', async function() {
    const newNFTHolder = accounts[3]
    let owner = await springNFTInstance.ownerOf.call(nftId)
    assert.equal(owner, nftHolder)

    const approvedAddress = accounts[2]
    await springNFTInstance.approve(approvedAddress, nftId)

    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)

    owner = await springNFTInstance.ownerOf.call(nftId)
    assert.equal(owner, newNFTHolder)

    const approved = await springNFTInstance.getApproved.call(nftId)
    assert.equal(approved, consts.ZERO_ADDRESS)
  });

  it('throw if "to" is zero address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(nftHolder, '0x0', nftId))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throw if msg.sender does not have permission to transfer', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId, {from: wetrustAddress}))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throw if token does not have an owner', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId + 1))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throw if from does not equal owner address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(newNFTHolder, nftHolder, nftId))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('checks that transfer event is emitted', async function() {
    const newNFTHolder = accounts[3]
    const res = await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)
    assert.equal(res.logs[0].event, 'Transfer')
  });
});
