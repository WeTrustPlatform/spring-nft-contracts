'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  RAINFOREST_UPDATE_ID,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  VIETSEEDS_ID,
  VIETSEEDS_UPDATE_ID
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('SpringNFT: addRecipientUpdate Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]
  const RAINFOREST_TRUST_ADDRESS = accounts[3]
  const NON_WETRUST_NOR_RECIPIENT_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })
  })

  it('checks that adding recipient update succeeds by signer address', async () => {
    await springNFTInstance.addRecipientUpdate(
      RAINFOREST_TRUST_ID, RAINFOREST_UPDATE_ID, { from: SIGNER_ADDRESS })

    assert.equal(await springNFTInstance.getUpdateCount(RAINFOREST_TRUST_ID), 1)
    assert.equal(
      (await springNFTInstance.recipientUpdates(RAINFOREST_TRUST_ID, 0))[0],
      RAINFOREST_UPDATE_ID)
  })

  it('checks that adding recipient update succeeds by recipient address', async () => {
    await springNFTInstance.addRecipientUpdate(
      RAINFOREST_TRUST_ID, RAINFOREST_UPDATE_ID, { from: RAINFOREST_TRUST_ADDRESS })

    assert.equal(await springNFTInstance.getUpdateCount(RAINFOREST_TRUST_ID), 1)
    assert.equal(
      (await springNFTInstance.recipientUpdates(RAINFOREST_TRUST_ID, 0))[0],
      RAINFOREST_UPDATE_ID)
  })

  it('throw if adding update to non-existent recipient', async () => {
    await utils.assertRevert(
      springNFTInstance.addRecipientUpdate(
        VIETSEEDS_ID, VIETSEEDS_UPDATE_ID, { from: SIGNER_ADDRESS }))
  })

  it('throw if adding update by msg.sender who is not wetrust or recipient address', async () => {
    await utils.assertRevert(
      springNFTInstance.addRecipientUpdate(
        RAINFOREST_TRUST_ID, RAINFOREST_UPDATE_ID, { from: NON_WETRUST_NOR_RECIPIENT_ADDRESS }))
  })

  it('throws if adding update when contract is in paused state', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.addRecipientUpdate(
        RAINFOREST_TRUST_ID, RAINFOREST_UPDATE_ID, { from: RAINFOREST_TRUST_ADDRESS }))
  })
})
