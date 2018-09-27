'use strict'

const { NON_EXISTENT_ADDRESS } = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: isApprovedForAll Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]
  const OPERATOR_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)
    await springNFTInstance.setApprovalForAll(OPERATOR_ADDRESS, true, { from: OWNER_ADDRESS })
  })

  it('returns true that operator is indeed approved', async () => {
    assert.isTrue(await springNFTInstance.isApprovedForAll.call(OWNER_ADDRESS, OPERATOR_ADDRESS))
  })

  it('throws if owner address does not exist', async () => {
    await utils.assertRevert(
      springNFTInstance.isApprovedForAll.call(OWNER_ADDRESS, NON_EXISTENT_ADDRESS))
  })

  it('throws if operator address does not exist', async () => {
    await utils.assertRevert(
      springNFTInstance.isApprovedForAll.call(NON_EXISTENT_ADDRESS, OPERATOR_ADDRESS))
  })
})
