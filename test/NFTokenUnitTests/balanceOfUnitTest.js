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
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: balanceOf Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[7]
  const SIGNER_ADDRESS = accounts[6]
  const OWNER_ADDRESS = accounts[0]
  const TRANSFERRED_ADDRESS = accounts[3]
  const TRANSFERRING_ADDRESS = accounts[2]

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
      NFT_B_ID, TRANSFERRING_ADDRESS, RAINFOREST_TRUST_ID, NFT_B_TRAITS, NFT_B_TYPE,
      { from: SIGNER_ADDRESS }
    )
  })

  it('checks owner balance having 1 token', async () => {
    assert.equal(await springNFTInstance.balanceOf.call(OWNER_ADDRESS), 1)
  })

  it('checks owner balance having 0 token when transfering 1 token to new address',
    async () => {
      await springNFTInstance.transferFrom(OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID,
        { from: OWNER_ADDRESS })

      assert.equal(await springNFTInstance.balanceOf(OWNER_ADDRESS), 0)
    })

  it('checks owner balance having 2 tokens when being transferred 1 token from new address',
    async () => {
      await springNFTInstance.transferFrom(TRANSFERRING_ADDRESS, OWNER_ADDRESS, NFT_B_ID,
        { from: TRANSFERRING_ADDRESS })

      assert.equal(await springNFTInstance.balanceOf(OWNER_ADDRESS), 2)
    })

  it('throws if zero address is given', async () => {
    await utils.assertRevert(springNFTInstance.balanceOf.call(NON_EXISTENT_ADDRESS))
  })
})
