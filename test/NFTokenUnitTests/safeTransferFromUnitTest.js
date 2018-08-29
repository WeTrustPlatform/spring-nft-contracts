'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const ERC721Reciever = artifacts.require('./test/ERC721ReceiverTest.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: safeTransferFrom Unit Test', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let nftId = 1

  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(nftId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    const newNFTHolder = accounts[3]
    let owner = await springNFTInstance.ownerOf.call(nftId)
    assert.equal(owner, nftHolder)

    await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)

    owner = await springNFTInstance.ownerOf.call(nftId)
    assert.equal(owner, newNFTHolder)
  });

  it('throw if "to" is zero address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, '0x0', nftId))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throw if msg.sender does not have permission to transfer', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, nftId, {from: wetrustAddress}))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throw if token does not have an owner', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, nftId + 1))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throw if from does not equal owner address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(newNFTHolder, accounts[0], nftId))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, nftId)
  });

  it('throws that ERC721_ON_RECEIVED hash is returned not from receiver', async function() {
    const recieverContract = await ERC721Reciever.new();

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, recieverContract.address, nftId))

    await recieverContract.setValueToReturnOnReceived('0x150b7a02')

    await springNFTInstance.safeTransferFrom(nftHolder, recieverContract.address, nftId)
  });

  it('checks that transfer event is emitted', async function() {
    const newNFTHolder = accounts[3]
    const res = await springNFTInstance.transferFrom(nftHolder, newNFTHolder, nftId)

    assert.equal(res.logs[0].event, 'Transfer')
  });
});
