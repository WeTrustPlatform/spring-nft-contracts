'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

contract('SpringNFT: changeWeTrustSigner Unit Tests', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]
  const NEW_SIGNER_ADDRESS = accounts[8]
  const NON_MANAGER_ADDRESS = accounts[0]

  let springNFTInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)
  })

  it('checks that signer address is specified upon instance creation', async () => {
    assert.equal(await springNFTInstance.wetrustSigner(), SIGNER_ADDRESS)
  })

  it('cheks that signer address is updated by manager address', async () => {
    await springNFTInstance.changeWeTrustSigner(NEW_SIGNER_ADDRESS, { from: MANAGER_ADDRESS })

    assert.equal(await springNFTInstance.wetrustSigner(), NEW_SIGNER_ADDRESS)
  })

  it('throws if non manager address is updating signer address', async () => {
    await utils.assertRevert(
      springNFTInstance.changeWeTrustSigner(NEW_SIGNER_ADDRESS, { from: NON_MANAGER_ADDRESS }))
  })

  it('throws if updating signer address when contract state is paused', async () => {
    await springNFTInstance.setPaused(true, { from: MANAGER_ADDRESS })

    await utils.assertRevert(
      springNFTInstance.changeWeTrustSigner(NEW_SIGNER_ADDRESS, { from: MANAGER_ADDRESS }))
  })
})
