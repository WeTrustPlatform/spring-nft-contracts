'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  RAINFOREST_TRUST_ADDRESS,
  VIETSEEDS_ID,
  NON_EXISTENT_ADDRESS
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('SpringNFT: createNFT Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]
  const NON_SIGNER_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RAINFOREST_TRUST_ID, RAINFOREST, RAINFOREST_TRUST_URL, RAINFOREST_TRUST_ADDRESS,
      { from: SIGNER_ADDRESS })
  })

  it('checks that NFT_A is created on blockchain', async () => {
    await springNFTInstance.createNFT(
      NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })

    const NFT = await springNFTInstance.nft(NFT_A_ID)
    assert.equal(NFT[0], OWNER_ADDRESS)   //owner
    assert.equal(NFT[2], NFT_A_TRAITS)    // traits
    assert.equal(NFT[4], NFT_A_TYPE)      // type
    assert.equal(NFT[3], 0)               // edition
  })

  it('checks that Transfer event is emitted', async () => {
    const res = await springNFTInstance.createNFT(
      NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })

    assert.equal(res.logs[0].event, 'Transfer')
    assert.equal(res.logs[0].args._from, NON_EXISTENT_ADDRESS)
    assert.equal(res.logs[0].args._to, OWNER_ADDRESS)
    assert.equal(res.logs[0].args._tokenId.toNumber(), NFT_A_ID)
  })

  it('throws if creating NFT with tokenId that already exists', async () => {
    await springNFTInstance.createNFT(
      NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
      { from: SIGNER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.createNFT(
        NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
        { from: SIGNER_ADDRESS }))
  })

  it('throws if creating NFT when msg.sender is not wetrust signer address', async () => {
    await utils.assertRevert(
      springNFTInstance.createNFT(
        NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
        { from: NON_SIGNER_ADDRESS }))
  })

  it('throws if creating NFT when its recipient does not exist', async () => {
    await utils.assertRevert(
      springNFTInstance.createNFT(
        NFT_A_ID, OWNER_ADDRESS, VIETSEEDS_ID, NFT_A_TRAITS, NFT_A_TYPE, { from: SIGNER_ADDRESS }))
  })

  it('throws if creating NFT when contract is in paused state', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.createNFT(
        NFT_A_ID, OWNER_ADDRESS, RAINFOREST_TRUST_ID, NFT_A_TRAITS, NFT_A_TYPE,
        { from: SIGNER_ADDRESS }))
  })
})
