'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NON_EXISTENT_NFT_ID,
  NON_EXISTENT_ADDRESS,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: transferFrom Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]
  const APPROVED_ADDRESS = accounts[2]
  const TRANSFERRED_ADDRESS = accounts[3]

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

  it('checks that transferred address is the new owner of transferred token', async () => {
    await springNFTInstance.transferFrom(OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID)

    assert.equal(await springNFTInstance.ownerOf.call(NFT_A_ID), TRANSFERRED_ADDRESS)
  })

  it('checks that approved address is removed after token is transferred', async () => {
    await springNFTInstance.approve(APPROVED_ADDRESS, NFT_A_ID)

    await springNFTInstance.transferFrom(
      OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS })

    assert.equal(await springNFTInstance.ownerOf.call(NFT_A_ID), TRANSFERRED_ADDRESS)
    assert.equal(await springNFTInstance.getApproved.call(NFT_A_ID), NON_EXISTENT_ADDRESS)
  })

  it('throw if transferring to zero address', async () => {
    await utils.assertRevert(
      springNFTInstance.transferFrom(
        OWNER_ADDRESS, NON_EXISTENT_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS }))
  })

  it('throw if msg.sender is not owner/approved/operator of the token', async () => {
    await utils.assertRevert(
      springNFTInstance.transferFrom(
        OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID, { from: SIGNER_ADDRESS }))
  })

  it('throw if transferring a non-existent token', async () => {
    await utils.assertRevert(
      springNFTInstance.transferFrom(
        OWNER_ADDRESS, TRANSFERRED_ADDRESS, NON_EXISTENT_NFT_ID, { from: OWNER_ADDRESS }))
  })

  it('throw if "from" address is not token owner address', async () => {
    await utils.assertRevert(
      springNFTInstance.transferFrom(
        TRANSFERRED_ADDRESS, OWNER_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS }))
  })

  it('checks that transfer event is emitted after transfer succeeds', async () => {
    const res = await springNFTInstance
      .transferFrom(OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS })

    assert.equal(res.logs[0].event, 'Transfer')
  })
})
