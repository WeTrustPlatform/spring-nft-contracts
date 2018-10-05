'use strict'

const {
  NFT_A_ID,
  NFT_A_TRAITS,
  NFT_A_TYPE,
  RAINFOREST,
  RAINFOREST_TRUST_ID,
  RAINFOREST_TRUST_URL,
  RAINFOREST_TRUST_ADDRESS
} = require('../test-data')

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('SpringNFT: addArtistSingature Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const OWNER_ADDRESS = accounts[0]

  // note, we don't need a real signature since smart contract doesn't validate the signer
  const ARTIST_SIGNATURE_A = '0xdeadbeef'
  const ARTIST_SIGNATURE_B = '0xdeadchicken'

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

  it('checks that artist signature is not yet added to existing NFT', async () => {
    assert.equal(await springNFTInstance.nftArtistSignature(NFT_A_ID), '0x')
  })

  it('checks that adding artist signature to NFT succeeds', async () => {
    await springNFTInstance.addArtistSignature(
      NFT_A_ID, ARTIST_SIGNATURE_A, { from: SIGNER_ADDRESS })

    assert.equal(await springNFTInstance.nftArtistSignature(NFT_A_ID), ARTIST_SIGNATURE_A)
  })

  it('throws if adding another artist signature to NFT that already has one', async () => {
    await springNFTInstance.addArtistSignature(
      NFT_A_ID, ARTIST_SIGNATURE_A, { from: SIGNER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.addArtistSignature(NFT_A_ID, ARTIST_SIGNATURE_B, { from: SIGNER_ADDRESS }))
  })

  it('throws if adding artist signature when contract is in paused state', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.addArtistSignature(NFT_A_ID, ARTIST_SIGNATURE_A, { from: SIGNER_ADDRESS }))
  })
})
