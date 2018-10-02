'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NON_EXISTENT_ADDRESS,
  RAINFOREST,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: setApprovalForAll Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]
  const OPERATOR_ADDRESS = accounts[2]

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

  it('checks that operator address is set successfully by owner address', async () => {
    await springNFTInstance.setApprovalForAll(OPERATOR_ADDRESS, true, { from: OWNER_ADDRESS })

    assert.isTrue(await springNFTInstance.isApprovedForAll.call(OWNER_ADDRESS, OPERATOR_ADDRESS))
  })

  it('throws if owner address set approval for all to zero address', async () => {
    await utils.assertRevert(
      springNFTInstance.setApprovalForAll(NON_EXISTENT_ADDRESS, true, { from: OWNER_ADDRESS }))
  })

  it('checks that approvalForAll event is emitted after owner successfully set', async () => {
    const res = await springNFTInstance.setApprovalForAll(
      OPERATOR_ADDRESS, true, { from: OWNER_ADDRESS })
    assert.equal(res.logs[0].event, 'ApprovalForAll')
  })
})
