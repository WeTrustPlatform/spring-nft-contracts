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
const utils = require('../utils/utils')

contract('NFToken: tokenByIndex Unit Test', (accounts) => {
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
    await springNFTInstance.createNFT(
      NFT_A_ID, NFT_A_OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })
  })

  it('checks that 1st token is returned when index is 0', async () => {
    assert.equal(await springNFTInstance.tokenByIndex(0), NFT_A_ID)
  })

  it('checks that 2nd token is returned when index is 1', async () => {
    await springNFTInstance.createNFT(
      NFT_B_ID, NFT_B_OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_B_TRAITS, NFT_B_TYPE,
      { from: SIGNER_ADDRESS })

    assert.equal(await springNFTInstance.tokenByIndex.call(1), NFT_B_ID)
  })

  it('throws if index is equal to totalSupply', async () => {
    await utils.assertRevert(springNFTInstance.tokenByIndex.call(1))
  })

  it('throws if index is greater than totalSupply', async () => {
    await utils.assertRevert(springNFTInstance.tokenByIndex.call(2))
  })
})
