'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  RAINFOREST_TRUST_ADDRESS,
  NON_EXISTENT_ADDRESS
} = require('../test-data')

const springNFT = artifacts.require('SpringNFT.sol')
const abi = require('ethereumjs-abi')
const utils = require('../utils/utils')

contract('SpringNFT: redeemToken Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const NON_SIGNER_ADDRESS = accounts[3]
  const REDEEMER_ADDRESS = accounts[0]
  const NON_REDEEMER_ADDRESS = accounts[2]

  let springNFTInstance
  let redeemableToken

  const paddedHex = (value) => '0x' + value
  const nonPaddedHex = (value) => value.substring(2)

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })

    const message =
      abi.rawEncode(['address', 'uint256'], [springNFTInstance.address, NFT_A_ID]).toString('hex')
      + nonPaddedHex(NFT_A_TYPE)
      + abi.rawEncode(['bytes32', 'bytes32'], [NFT_A_TRAITS, RAINFOREST_TRUST_ID]).toString('hex')

    const msgHash = await springNFTInstance.createRedeemMessageHash(
      NFT_A_ID, NFT_A_TYPE, NFT_A_TRAITS, RAINFOREST_TRUST_ID)

    const signature = await web3.eth.sign(SIGNER_ADDRESS, msgHash)
    redeemableToken = paddedHex(message + nonPaddedHex(signature))
  })

  it('checks that token is created after redeeming', async () => {
    await springNFTInstance.redeemToken(redeemableToken, { from: REDEEMER_ADDRESS })

    assert.equal(await springNFTInstance.balanceOf(REDEEMER_ADDRESS), 1)

    const token = await springNFTInstance.nft(NFT_A_ID)
    assert.equal(token[0], REDEEMER_ADDRESS)
    assert.equal(token[2], NFT_A_TRAITS)
    assert.equal(token[4], NFT_A_TYPE)
    assert.equal(token[5], RAINFOREST_TRUST_ID)
  })

  it('checks that Transfer event is emitted after successful redeeming', async () => {
    const res = await springNFTInstance.redeemToken(redeemableToken)

    assert.equal(res.logs[0].event, 'Transfer')
    assert.equal(res.logs[0].args._from, NON_EXISTENT_ADDRESS)
    assert.equal(res.logs[0].args._to, REDEEMER_ADDRESS)
    assert.equal(res.logs[0].args._tokenId.toNumber(), NFT_A_ID)
  })

  it('throw if redeem signed message is used more than once', async () => {
    await springNFTInstance.redeemToken(redeemableToken, { from: REDEEMER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.redeemToken(redeemableToken, { from: NON_REDEEMER_ADDRESS }))
  })

  it('throws if redeem signed message was not signed by wetrust signer address', async () => {
    const message =
      abi.rawEncode(['address', 'uint256'], [springNFTInstance.address, NFT_A_ID]).toString('hex')
      + nonPaddedHex(NFT_A_TYPE)
      + abi.rawEncode(['bytes32', 'bytes32'], [NFT_A_TRAITS, RAINFOREST_TRUST_ID]).toString('hex')

    const msgHash = await springNFTInstance.createRedeemMessageHash(
      NFT_A_ID, NFT_A_TYPE, NFT_A_TRAITS, RAINFOREST_TRUST_ID)

    const signature = await web3.eth.sign(NON_SIGNER_ADDRESS, msgHash)
    redeemableToken = paddedHex(message + nonPaddedHex(signature))

    // perform test
    await utils.assertRevert(springNFTInstance.redeemToken(redeemableToken))
  })

  it('throws if redeeming when contract is in paused state', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.redeemToken(redeemableToken, { from: REDEEMER_ADDRESS }))
  })
})
