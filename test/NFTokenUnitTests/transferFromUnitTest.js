'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')
const consts = require('../utils/consts')

let springNFTInstance;

contract('NFToken: transferFrom Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let tokenId

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    tokenId = 1;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    const newNFTHolder = accounts[3]
    let owner = await springNFTInstance.ownerOf.call(tokenId)
    assert.equal(owner, nftHolder)

    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)

    owner = await springNFTInstance.ownerOf.call(tokenId)
    assert.equal(owner, newNFTHolder)
  });

  it('checks that approval is removed when token is transferred', async function() {
    const newNFTHolder = accounts[3]
    let owner = await springNFTInstance.ownerOf.call(tokenId)
    assert.equal(owner, nftHolder)

    const approvedAddress = accounts[2]
    await springNFTInstance.approve(approvedAddress, tokenId)

    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)

    owner = await springNFTInstance.ownerOf.call(tokenId)
    assert.equal(owner, newNFTHolder)

    const approved = await springNFTInstance.getApproved.call(tokenId)
    assert.equal(approved, consts.ZERO_ADDRESS)
  });

  it('throw if "to" is zero address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(nftHolder, '0x0', tokenId))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throw if msg.sender does not have permission to transfer', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId, {from: wetrustAddress}))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throw if token does not have an owner', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId + 1))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throw if from does not equal owner address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.transferFrom(newNFTHolder, nftHolder, tokenId))
    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('checks that transfer event is emitted', async function() {
    const newNFTHolder = accounts[3]
    const res = await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)
    assert.equal(res.logs[0].event, 'Transfer')
  });
});
