'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NFT_B_ID,
  NFT_B_TRAITS,
  NFT_B_TYPE,
  RAINFOREST,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')

contract('NFToken: approve Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[7]
  const SIGNER_ADDRESS = accounts[6]
  const OWNER_ADDRESS = accounts[0]
  const TRANSFERRED_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      NFT_B_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_B_TRAITS, NFT_B_TYPE,
      { from: SIGNER_ADDRESS })
  })

  it('checks that owner has 2 tokens by creation', async () => {
    const tokenList = await springNFTInstance.getOwnedTokenList(OWNER_ADDRESS)

    assert.lengthOf(tokenList, 2)
    assert.equal(tokenList[0], NFT_A_ID)
    assert.equal(tokenList[1], NFT_B_ID)
  })

  it('checks that owner has 1 token left after transfering to another account', async () => {
    await springNFTInstance.transferFrom(OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID)

    const tokenList = await springNFTInstance.getOwnedTokenList(OWNER_ADDRESS)

    assert.lengthOf(tokenList, 1)
    assert.equal(tokenList[0], NFT_B_ID)
  })
})
