'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NON_EXISTENT_NFT_ID,
  RAINFOREST,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: approve Unit Test', (accounts) => {
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

  it('checks that proper values are updated', async () => {
    await springNFTInstance.approve(APPROVED_ADDRESS, NFT_A_ID)

    const actualAddress = await springNFTInstance.getApproved.call(NFT_A_ID)
    assert.equal(actualAddress, APPROVED_ADDRESS)
  })

  it('throw if msg.sender doesnt have permission to approve', async () => {
    await utils.assertRevert(
      springNFTInstance.approve(APPROVED_ADDRESS, NFT_A_ID, { from: MANAGER_ADDRESS }))
  })

  it('throw if owner doesnt exist for tokenId', async () => {
    await utils.assertRevert(springNFTInstance.approve(APPROVED_ADDRESS, NON_EXISTENT_NFT_ID))
  })

  it('throw if approved address is token owner', async () => {
    await utils.assertRevert(
      springNFTInstance.approve(OWNER_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS }))
  })

  it('checks that approval event is emitted', async () => {
    const res = await springNFTInstance.approve(APPROVED_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS })
    assert.equal(res.logs[0].event, 'Approval')
  })
})
