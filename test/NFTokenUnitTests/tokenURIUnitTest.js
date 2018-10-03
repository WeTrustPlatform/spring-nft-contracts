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

contract('NFToken: approve Unit Test', (accounts) => {
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

  it('checks that token A URI is correctly returned', async () => {
    await springNFTInstance.createNFT(
      NFT_A_ID, NFT_A_OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })

    assert.equal(
      await springNFTInstance.tokenURI(NFT_A_ID),
      `https://spring.wetrust.io/shiba/${NFT_A_ID}`)
  })

  it('checks that token B URI is correctly returned', async () => {
    await springNFTInstance.createNFT(
      NFT_B_ID, NFT_B_OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_B_TRAITS, NFT_B_TYPE,
      { from: SIGNER_ADDRESS })

    assert.equal(
      await springNFTInstance.tokenURI(NFT_B_ID),
      `https://spring.wetrust.io/shiba/${NFT_B_ID}`)
  })
})
