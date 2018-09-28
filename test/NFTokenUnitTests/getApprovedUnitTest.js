'use strict'

const {
  RAINFOREST_TRUST_ID,
  RAINFOREST,
  RAINFOREST_TRUST_URL,
  RAINFOREST_TRUST_ADDRESS,
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NON_EXISTENT_NFT_ID
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: getApproved Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[7]
  const SIGNER_ADDRESS = accounts[6]
  const OWNER_ADDRESS = accounts[0]
  const APPROVED_ADDRESS = accounts[2]

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

  it('returns correct approved address', async () => {
    await springNFTInstance.approve(APPROVED_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS })

    assert.equal(await springNFTInstance.getApproved.call(NFT_A_ID), APPROVED_ADDRESS)
  })

  it('throws if owner does not exist', async () => {
    await utils.assertRevert(springNFTInstance.getApproved.call(NON_EXISTENT_NFT_ID))
  })
})
