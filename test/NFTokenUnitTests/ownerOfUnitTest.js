'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  RAINFOREST,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  NON_EXISTENT_NFT_ID
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: ownerOf Unit Test', (accounts) => {
  const SIGNER_ADDRESS = accounts[7]
  const MANAGER_ADDRESS = accounts[6]
  const OWNER_ADDRESS = accounts[0]

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

  it('returns correct owner address of token', async () => {
    assert.equal(await springNFTInstance.ownerOf.call(NFT_A_ID), OWNER_ADDRESS)
  })

  it('throws if owner address does not exist', async () => {
    await utils.assertRevert(springNFTInstance.ownerOf.call(NON_EXISTENT_NFT_ID))
  })
})
