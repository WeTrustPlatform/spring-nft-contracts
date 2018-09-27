'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('NFToken: balanceOf Unit Test', (accounts) => {
  const RECIPIENT_ID = '0x1'
  const RECIPIENT_NAME = 'recipient name'
  const RECIPIENT_URL = 'recipient url'
  const RECIPIENT_ADDRESS = '0x2'

  const NFT_OWNER = accounts[0]
  const NFT_ID = 1
  const NFT_TRAITS = '0x01'
  const NFT_TYPE = '0x01'
  const TRANSFERING_NFT_ID = 2

  const MANAGER_ADDRESS = accounts[7]
  const SIGNER_ADDRESS = accounts[6]
  const TRANSFERED_TOKEN_ADDRESS = accounts[3]
  const TRANSFERING_TOKEN_ADDRESS = accounts[2]
  const NON_EXISTENT_ADDRESS = '0x0'

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RECIPIENT_ID, RECIPIENT_NAME, RECIPIENT_URL, RECIPIENT_ADDRESS, { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      NFT_ID, NFT_OWNER, RECIPIENT_ID, NFT_TRAITS, NFT_TYPE, { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      TRANSFERING_NFT_ID, TRANSFERING_TOKEN_ADDRESS, RECIPIENT_ID, NFT_TRAITS, NFT_TYPE,
      { from: SIGNER_ADDRESS }
    )
  })

  it('checks owner balance having 1 token', async () => {
    assert.equal(await springNFTInstance.balanceOf.call(NFT_OWNER), 1)
  })

  it('checks owner balance having 0 token when transfering 1 token to new address',
    async () => {
      await springNFTInstance.transferFrom(NFT_OWNER, TRANSFERED_TOKEN_ADDRESS, NFT_ID,
        { from: NFT_OWNER })

      assert.equal(await springNFTInstance.balanceOf(NFT_OWNER), 0)
    })

  it('checks owner balance having 2 tokens when being transferred 1 token from new address',
    async () => {
      await springNFTInstance.transferFrom(TRANSFERING_TOKEN_ADDRESS, NFT_OWNER, TRANSFERING_NFT_ID,
        { from: TRANSFERING_TOKEN_ADDRESS })

      assert.equal(await springNFTInstance.balanceOf(NFT_OWNER), 2)
    })

  it('throws if zero address is given', async () => {
    await utils.assertRevert(springNFTInstance.balanceOf.call(NON_EXISTENT_ADDRESS))
  })
})
