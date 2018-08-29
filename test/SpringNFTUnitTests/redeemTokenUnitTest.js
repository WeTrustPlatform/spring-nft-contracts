'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const abi = require('ethereumjs-abi')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: redeemToken Unit Tests', function(accounts) {
  const wetrustAddress = accounts[7]
  const nftType = '0x01320000'
  const traits = '0xdead'
  const recipientId = '0xbeef'
  let nftId = 1;
  let redeemableToken;
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);

    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})

    const message = '0x' + abi.rawEncode(['uint256'], [nftId]).toString('hex') + nftType.substring(2) + abi.rawEncode(['bytes32', 'bytes32'], [traits, recipientId]).toString('hex')
    const msgHash = await springNFTInstance.createRedeemMessageHash.call(nftId, nftType, traits, recipientId);
    const signature = utils.createSignedMsg([7] /* wetrustAddress */, msgHash.substring(2))
    redeemableToken = message + signature.substring(2)
  });

  it('checks that proper values were updated', async function() {
    const redeemerAddress = accounts[0]

    // first check to see how many NFT redeemer have
    let nftCount = await springNFTInstance.balanceOf(redeemerAddress)
    assert.equal(nftCount, 0)
    const res = await springNFTInstance.redeemToken(redeemableToken)

    nftCount = await springNFTInstance.balanceOf(redeemerAddress)
    assert.equal(nftCount, 1)

    const token = await springNFTInstance.nft(nftId);
    assert.equal(token[0], redeemerAddress) // owner
    assert.equal(token[2], '0x' + abi.rawEncode(['bytes32'], [traits]).toString('hex'))
    assert.equal(token[4], nftType)
    assert.equal(token[5], '0x' + abi.rawEncode(['bytes32'], [recipientId]).toString('hex'))
  });

  it('throw if redeem script is used more than once', async function() {
    await springNFTInstance.redeemToken(redeemableToken)

    await utils.assertRevert(springNFTInstance.redeemToken(redeemableToken))
  });

  it('throws if signer is not wetrust', async function() {
    // test that it works with wetrust signed token
    await springNFTInstance.redeemToken(redeemableToken)

    const message = '0x' + abi.rawEncode(['uint256'], [nftId + 1]).toString('hex') + nftType.substring(2) + abi.rawEncode(['bytes32', 'bytes32'], [traits, recipientId]).toString('hex')
    const msgHash = await springNFTInstance.createRedeemMessageHash.call(nftId, nftType, traits, recipientId);
    const signature = utils.createSignedMsg([5],  msgHash.substring(2))

    redeemableToken = message + signature.substring(2)
    await utils.assertRevert(springNFTInstance.redeemToken(redeemableToken))
  });

  it('throws if contract is in paused state', async function() {
    await springNFTInstance.setPaused(true, {from: wetrustAddress})
    await utils.assertRevert(springNFTInstance.redeemToken(redeemableToken))
  });
});
