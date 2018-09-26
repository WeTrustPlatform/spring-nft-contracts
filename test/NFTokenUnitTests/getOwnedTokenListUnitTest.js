'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')

contract('NFToken: approve Unit Test', (accounts) => {
  const RECIPIENT_ID = '0x1'
  const RECIPIENT_NAME = 'recipient name'
  const RECIPIENT_URL = 'recipient url'
  const RECIPIENT_ADDRESS = '0x2'

  const NFT_OWNER = accounts[0]
  const FIRST_NFT_ID = 1
  const FIRST_NFT_TRAITS = '0x01'
  const FIRST_NFT_TYPE = '0x01'

  const SECOND_NFT_ID = 3
  const SECOND_NFT_TRAITS = '0x03'
  const SECOND_NFT_TYPE = '0x03'

  const MANAGER_ADDRESS = accounts[7]
  const SIGNER_ADDRESS = accounts[6]
  const TRANSFERED_ACCOUNT_ADDRESS = accounts[2]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

    await springNFTInstance.addRecipient(
      RECIPIENT_ID, RECIPIENT_NAME, RECIPIENT_URL, RECIPIENT_ADDRESS, { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      FIRST_NFT_ID, NFT_OWNER, RECIPIENT_ID, FIRST_NFT_TRAITS, FIRST_NFT_TYPE,
      { from: SIGNER_ADDRESS })
    await springNFTInstance.createNFT(
      SECOND_NFT_ID, NFT_OWNER, RECIPIENT_ID, SECOND_NFT_TRAITS, SECOND_NFT_TYPE,
      { from: SIGNER_ADDRESS })
  })

  it('checks that owner has 2 tokens by creation', async () => {
    const tokenList = await springNFTInstance.getOwnedTokenList(NFT_OWNER)

    assert.lengthOf(tokenList, 2)
    assert.equal(tokenList[0], FIRST_NFT_ID)
    assert.equal(tokenList[1], SECOND_NFT_ID)
  })

  it('checks that owner has 1 token left after transfering to another account', async () => {
    await springNFTInstance.transferFrom(NFT_OWNER, TRANSFERED_ACCOUNT_ADDRESS, FIRST_NFT_ID)

    const tokenList = await springNFTInstance.getOwnedTokenList(NFT_OWNER)

    assert.lengthOf(tokenList, 1)
    assert.equal(tokenList[0], SECOND_NFT_ID)
  })
})
