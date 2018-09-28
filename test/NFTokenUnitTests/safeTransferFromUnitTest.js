'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  NON_EXISTENT_NFT_ID,
  RAINFOREST,
  NON_EXISTENT_ADDRESS,
  RAINFOREST_TRUST_ADDRESS,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const ERC721Reciever = artifacts.require('./test/ERC721ReceiverTest.sol')
const EmptyContract = artifacts.require('./test/EmptyContract.sol')
const utils = require('../utils/utils')

contract('NFToken: safeTransferFrom Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]
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

  it('checks that transferred token has new owner after safe transfer', async () => {
    await springNFTInstance.transferFrom(
      OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS })
    assert.equal(await springNFTInstance.ownerOf.call(NFT_A_ID), TRANSFERRED_ADDRESS)
  })

  it('throw if safe transfer "to" zero address', async () => {
    await utils.assertRevert(
      springNFTInstance.safeTransferFrom(
        OWNER_ADDRESS, NON_EXISTENT_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS }))
  })

  it('throw if msg.sender does not have permission to safe transfer', async () => {
    await utils.assertRevert(
      springNFTInstance.safeTransferFrom(
        OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID, { from: SIGNER_ADDRESS }))
  })

  it('throw if token does not have an owner', async () => {
    await utils.assertRevert(
      springNFTInstance.safeTransferFrom(
        OWNER_ADDRESS, TRANSFERRED_ADDRESS, NON_EXISTENT_NFT_ID, { from: OWNER_ADDRESS }))
  })

  it('throw if safe transfer from address is not token owner address', async () => {
    await utils.assertRevert(
      springNFTInstance.safeTransferFrom(
        TRANSFERRED_ADDRESS, OWNER_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS }))
  })

  it('throws when transfer to receiver contract does not return ERC721_ON_RECEIVED_MAGIC_HASH',
    async () => {
      const recieverContract = await EmptyContract.new()

      await utils.assertRevert(
        springNFTInstance.safeTransferFrom(
          OWNER_ADDRESS, recieverContract.address, NFT_A_ID, { from: OWNER_ADDRESS }))
    })

  it('checks transfer to receiver contract succeeds when ERC721_ON_RECEIVED_MAGIC_HASH is returned',
    async () => {
      const recieverContract = await ERC721Reciever.new()

      await springNFTInstance.safeTransferFrom(
        OWNER_ADDRESS, recieverContract.address, NFT_A_ID, { from: OWNER_ADDRESS })
    })

  it('checks that transfer event is emitted', async () => {
    const res = await springNFTInstance.safeTransferFrom(
      OWNER_ADDRESS, TRANSFERRED_ADDRESS, NFT_A_ID, { from: OWNER_ADDRESS })
    assert.equal(res.logs[0].event, 'Transfer')
  })
})
