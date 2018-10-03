'use strict'

const {
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  RAINFOREST_TRUST_ADDRESS
} = require('../test-data')

const chai = require('chai')
chai.use(require('chai-string'))
const assert = chai.assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('SpringNFT: addRecipient Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const NON_SIGNER_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)
  })

  it('checks that rainforest does not exist before adding', async () => {
    assert.isFalse((await springNFTInstance.recipients(RAINFOREST_TRUST_ID))[4])
  })

  it('checks that rainforest exists after adding', async () => {
    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })

    const receivedRecipient = await springNFTInstance.recipients(RAINFOREST_TRUST_ID)

    assert.equal(receivedRecipient[0], RAINFOREST)
    assert.equal(receivedRecipient[1], RAINFOREST_TRUST_URL)
    assert.equalIgnoreCase(receivedRecipient[2], RAINFOREST_TRUST_ADDRESS)
    assert.equal(receivedRecipient[3], 0)
    assert.isTrue(receivedRecipient[4])
  })

  it('throw if adding recipient is not initiated by signer address', async () => {
    await utils.assertRevert(
      springNFTInstance.addRecipient(
        RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
        { from: NON_SIGNER_ADDRESS }))
  })

  it('throw if adding recipient that already exists', async () => {
    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.addRecipient(
        RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
        { from: SIGNER_ADDRESS }))
  })

  it('throw if adding recipient whose name is empty string', async () => {
    await utils.assertRevert(
      springNFTInstance.addRecipient(
        RAINFOREST_TRUST_ID, '', RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
        { from: SIGNER_ADDRESS }))
  })

  it('throws if adding recipient while contract is in paused state', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.addRecipient(
        RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
        { from: SIGNER_ADDRESS }))
  })
})
