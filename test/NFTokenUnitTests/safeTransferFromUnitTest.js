'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const ERC721Reciever = artifacts.require('./test/ERC721ReceiverTest.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('NFToken: safeTransferFrom Unit Test', function(accounts) {
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

  it('throw if "to" is zero address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, '0x0', tokenId))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throw if msg.sender does not have permission to transfer', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, tokenId, {from: wetrustAddress}))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throw if token does not have an owner', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, tokenId + 1))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throw if from does not equal owner address', async function() {
    const newNFTHolder = accounts[3]

    await utils.assertRevert(springNFTInstance.safeTransferFrom(newNFTHolder, accounts[0], tokenId))
    await springNFTInstance.safeTransferFrom(nftHolder, newNFTHolder, tokenId)
  });

  it('throws that ERC721_ON_RECEIVED hash is returned not from receiver', async function() {
    const recieverContract = await ERC721Reciever.new();

    await utils.assertRevert(springNFTInstance.safeTransferFrom(nftHolder, recieverContract.address, tokenId))

    await recieverContract.setValueToReturnOnReceived('0x150b7a02')

    await springNFTInstance.safeTransferFrom(nftHolder, recieverContract.address, tokenId)
  });

  it('checks that transfer event is emitted', async function() {
    const newNFTHolder = accounts[3]
    const res = await springNFTInstance.transferFrom(nftHolder, newNFTHolder, tokenId)

    assert.equal(res.logs[0].event, 'Transfer')
  });
});
