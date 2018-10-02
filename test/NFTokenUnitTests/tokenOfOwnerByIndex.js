'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NFT_B_ID,
  NFT_B_TRAITS,
  NFT_B_TYPE,
  NON_EXISTENT_ADDRESS,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: tokenOfOwnerByIndex Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
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

  it('checks that 1st token of owner is returned when index is 0', async () => {
    assert.equal(await springNFTInstance.tokenOfOwnerByIndex(OWNER_ADDRESS, 0), NFT_A_ID)
  })

  it('checks that 2nd token of owner is returned when index is 1', async () => {
    await springNFTInstance.createNFT(
      NFT_B_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_B_TRAITS, NFT_B_TYPE,
      { from: SIGNER_ADDRESS })

    assert.equal(await springNFTInstance.tokenOfOwnerByIndex(OWNER_ADDRESS, 1), NFT_B_ID)
  })

  it('throw if owner address is zero address', async () => {
    await utils.assertRevert(springNFTInstance.tokenOfOwnerByIndex.call(NON_EXISTENT_ADDRESS, 0))
  })

  it('throw if index is equal to # of tokens owner has', async () => {
    await utils.assertRevert(springNFTInstance.tokenOfOwnerByIndex.call(OWNER_ADDRESS, 1))
  })

  it('throw if index is greater than # of token owner has', async () => {
    await utils.assertRevert(springNFTInstance.tokenOfOwnerByIndex.call(OWNER_ADDRESS, 2))
  })
})
