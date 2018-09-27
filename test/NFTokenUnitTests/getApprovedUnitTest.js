'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: getApproved Unit Test', (accounts) => {
  const RECIPIENT_ID = '0x1'
  const RECIPIENT_NAME = 'recipient name'
  const RECIPIENT_URL = 'recipient url'
  const RECIPIENT_ADDRESS = '0x2'

  const NFT_OWNER = accounts[0]
  const NFT_ID = 1
  const NFT_TRAITS = '0x01'
  const NFT_TYPE = '0x01'
  const NON_EXISTENT_NFT_ID = 2

  const MANAGER_ADDRESS = accounts[7]
  const SIGNER_ADDRESS = accounts[6]
  const NFT_APPROVED_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RECIPIENT_ID, RECIPIENT_NAME, RECIPIENT_URL, RECIPIENT_ADDRESS, { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      NFT_ID, NFT_OWNER, RECIPIENT_ID, NFT_TRAITS, NFT_TYPE, { from: SIGNER_ADDRESS })
  })

  it('returns correct approved address', async () => {
    await springNFTInstance.approve(NFT_APPROVED_ADDRESS, NFT_ID, { from: NFT_OWNER })

    assert.equal(await springNFTInstance.getApproved.call(NFT_ID), NFT_APPROVED_ADDRESS)
  })

  it('throws if owner does not exist', async () => {
    await utils.assertRevert(springNFTInstance.getApproved.call(NON_EXISTENT_NFT_ID))
  })
})
