'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: approve Unit Test', (accounts) => {
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

  it('checks that proper values are updated', async () => {
    await springNFTInstance.approve(NFT_APPROVED_ADDRESS, NFT_ID)

    const actualAddress = await springNFTInstance.getApproved.call(NFT_ID)
    assert.equal(actualAddress, NFT_APPROVED_ADDRESS)
  })

  it('throw if msg.sender doesnt have permission to approve', async () => {
    await utils.assertRevert(
      springNFTInstance.approve(NFT_APPROVED_ADDRESS, NFT_ID, { from: MANAGER_ADDRESS }))
  })

  it('throw if owner doesnt exist for tokenId', async () => {
    await utils.assertRevert(springNFTInstance.approve(NFT_APPROVED_ADDRESS, NON_EXISTENT_NFT_ID))
  })

  it('throw if approved address is token owner', async () => {
    await utils.assertRevert(springNFTInstance.approve(NFT_OWNER, NFT_ID, { from: NFT_OWNER }))
  })

  it('checks that approval event is emitted', async () => {
    const res = await springNFTInstance.approve(NFT_APPROVED_ADDRESS, NFT_ID, { from: NFT_OWNER })
    assert.equal(res.logs[0].event, 'Approval')
  })
})
