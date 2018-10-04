'use strict'

const {
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  RAINFOREST_TRUST_ADDRESS,
  VIETSEEDS_ID,
  VIETSEEDS,
  VIETSEEEDS_URL,
  VIETSEEDS_ADDRESS
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('SpringNFT: updateRecipientInfo Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const NEW_RAINFORES_TRUST_ADDRESS = accounts[4]
  const NON_SIGNER_ADDRESS = accounts[0]

  const NEW_RAINFOREST_TRUST = 'new rainforest trust name'
  const NEW_RAINFOREST_TRUST_URL = 'new rainforest trust url'

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })
  })

  it('checks that new name, new url, new address are updated', async () => {
    await springNFTInstance.updateRecipientInfo(
      RAINFOREST_TRUST_ID,
      NEW_RAINFOREST_TRUST,
      NEW_RAINFOREST_TRUST_URL,
      NEW_RAINFORES_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })

    const updatedRecipient = await springNFTInstance.recipients.call(RAINFOREST_TRUST_ID)

    assert.equal(updatedRecipient[0], NEW_RAINFOREST_TRUST)         // name
    assert.equal(updatedRecipient[1], NEW_RAINFOREST_TRUST_URL)     // url
    assert.equal(updatedRecipient[2], NEW_RAINFORES_TRUST_ADDRESS)  // owner
    assert.equal(updatedRecipient[3], 0)                            // nftCount
    assert.isTrue(updatedRecipient[4])                              // exists
  })

  it('throw if updating recipient info by a non wetrust signer address', async () => {
    await utils.assertRevert(
      springNFTInstance.updateRecipientInfo(
        RAINFOREST_TRUST_ID,
        NEW_RAINFOREST_TRUST,
        NEW_RAINFOREST_TRUST_URL,
        NEW_RAINFORES_TRUST_ADDRESS,
        { from: NON_SIGNER_ADDRESS }))
  })

  it('throw if updating info of non-existent recipient', async () => {
    await utils.assertRevert(
      springNFTInstance.updateRecipientInfo(
        VIETSEEDS_ID, VIETSEEDS, VIETSEEEDS_URL, VIETSEEDS_ADDRESS, { from: SIGNER_ADDRESS }))
  })

  it('throw if updating recipient new name to empty string', async () => {
    await utils.assertRevert(
      springNFTInstance.updateRecipientInfo(
        RAINFOREST_TRUST_ID,
        '',
        NEW_RAINFOREST_TRUST_URL,
        NEW_RAINFORES_TRUST_ADDRESS,
        { from: SIGNER_ADDRESS }))
  })

  it('throws if updating recipient info when contract is in paused state', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.updateRecipientInfo(
        RAINFOREST_TRUST_ID,
        NEW_RAINFOREST_TRUST,
        NEW_RAINFOREST_TRUST_URL,
        NEW_RAINFORES_TRUST_ADDRESS,
        { from: SIGNER_ADDRESS }))
  })
})
