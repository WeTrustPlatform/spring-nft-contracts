'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NFT_B_ID,
  NFT_B_TRAITS,
  NFT_B_TYPE,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')

contract('NFToken: totalSupply Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const NFT_A_OWNER_ADDRESS = accounts[0]
  const NFT_B_OWNER_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })
  })

  it('checks that total supply is 0 when no token has been created', async () => {
    assert.equal(await springNFTInstance.totalSupply(), 0)
  })

  it('checks that total supply is 2 when 2 tokens have been created', async () => {
    await springNFTInstance.createNFT(
      NFT_A_ID, NFT_A_OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      NFT_B_ID, NFT_B_OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_B_TRAITS, NFT_B_TYPE,
      { from: SIGNER_ADDRESS })

    assert.equal(await springNFTInstance.totalSupply(), 2)
  })
})
