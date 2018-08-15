'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const abi = require('ethereumjs-abi')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: batchCreate Unit Tests', function(accounts) {
  const wetrustAddress = accounts[7];
  const receiver = accounts[2]
  const traits = '0xdead'
  const traits2 = '0xdead2'
  const recipientId = '0xbeef'
  const nftType = 'deed0000'
  const nftType2 = '0000dddd'
  let nftParams
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    nftParams = '0x' + abi.rawEncode(['address', 'bytes32', 'bytes32'], [receiver, recipientId, traits]).toString('hex') + nftType
      + abi.rawEncode(['address', 'bytes32', 'bytes32'], [receiver, recipientId, traits2]).toString('hex') + nftType2
  });

  it('checks that proper values were updated', async function() {
    let nftCount = await springNFTInstance.balanceOf(receiver)
    assert.equal(nftCount, 0)

    await springNFTInstance.batchCreate(nftParams, {from: wetrustAddress})

    nftCount = await springNFTInstance.balanceOf(receiver)
    assert.equal(nftCount, 2)

    const firstNFT = await springNFTInstance.nft(1);
    assert.equal(firstNFT[0], receiver) // owner
    assert.equal(firstNFT[2], '0x' + abi.rawEncode(['bytes32'], [traits]).toString('hex')) // traits
    assert.equal(firstNFT[4], '0x' + nftType) // type
    assert.equal(firstNFT[5], '0x' + abi.rawEncode(['bytes32'], [recipientId]).toString('hex')) // recipientId

    const secondNFT = await springNFTInstance.nft(2);
    assert.equal(secondNFT[0], receiver) // owner
    assert.equal(secondNFT[2], '0x' + abi.rawEncode(['bytes32'], [traits2]).toString('hex')) // traits
    assert.equal(secondNFT[4], '0x' + nftType2) // type
    assert.equal(secondNFT[5], '0x' + abi.rawEncode(['bytes32'], [recipientId]).toString('hex')) // recipientId
  });

  it('throw if msg.sender is not wetrust', async function() {
    await utils.assertRevert(springNFTInstance.batchCreate(nftParams))

    await springNFTInstance.batchCreate(nftParams, {from: wetrustAddress})
  });

  it('throws if contract is in paused state', async function() {
    await springNFTInstance.setPaused(true, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.batchCreate(nftParams, {from: wetrustAddress}))
  });
});
