'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')
const ERC165Query = artifacts.require('./test/ERC165Query.sol')

contract('NFToken: supportsInterface Unit Test', (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]

  let springNFTInstance
  let erc165QueryInstance

  beforeEach(async () => {
    springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)
    erc165QueryInstance = await ERC165Query.new()
  })

  it('checks that Spring contract implements ERC165 interface', async () => {
    assert.isTrue(
      await erc165QueryInstance.doesContractImplementInterface(
        springNFTInstance.address, '0x01ffc9a7'))
  })

  it('checks that Spring contract implements ERC721 interface', async () => {
    assert.isTrue(
      await erc165QueryInstance.doesContractImplementInterface(
        springNFTInstance.address, '0x80ac58cd'))
  })

  it('checks that Spring contract implements ERC721Enumerable interface', async () => {
    assert.isTrue(
      await erc165QueryInstance.doesContractImplementInterface(
        springNFTInstance.address, '0x780e9d63'))
  })

  it('checks that Spring contract implements ERC721Metadata interface', async () => {
    assert.isTrue(
      await erc165QueryInstance.doesContractImplementInterface(
        springNFTInstance.address, '0x5b5e139f'))
  })
})
