'use strict'

const assert = require('chai').assert
const springNFT = artifacts.require('SpringNFT.sol')

contract('SpringNFT: determineEdition Unit Tests', async (accounts) => {
  const MANAGER_ADDRESS = accounts[6]
  const SIGNER_ADDRESS = accounts[7]

  const springNFTInstance = await springNFT.new(SIGNER_ADDRESS, MANAGER_ADDRESS)

  describe('should return edition 0 for the 1st generation of 100 tokens: 1st - 100th', () => {
    it('should return edition 0 for the 1st token ever', async () => {
      assert.equal(await springNFTInstance.determineEdition(1), 0)
    })

    it('should return edition 0 for the 50th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(50), 0)
    })

    it('should return edition 0 for the 100th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(100), 0)
    })
  })

  describe('should return edition 1 for the 2nd generation of 400 tokens: 101st - 500th', () => {
    it('should return edition 1 for the 101st token', async () => {
      assert.equal(await springNFTInstance.determineEdition(101), 1)
    })

    it('should return edition 1 for the 250th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(250), 1)
    })

    it('should return edition 1 for the 500th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(500), 1)
    })
  })

  describe('should return edition 2 for the 3rd generation of 700 tokens: 501st - 1200th', () => {
    it('should return edition 2 for the 501st token', async () => {
      assert.equal(await springNFTInstance.determineEdition(501), 2)
    })

    it('should return edition 2 for the 1000th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(1000), 2)
    })

    it('should return edition 2 for the 1200th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(1200), 2)
    })
  })

  describe('should return edition 3 for the 4th generation of 1000 tokens: 1201st - 2200th', () => {
    it('should return edition 3 for the 1201st token', async () => {
      assert.equal(await springNFTInstance.determineEdition(1201), 3)
    })

    it('should return edition 3 for the 2000th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(2000), 3)
    })

    it('should return edition 3 for the 2200th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(2200), 3)
    })
  })

  describe('should return edition 4 for the 5th generation of 1300 tokens: 2201st - 3500th', () => {
    it('should return edition 4 for the 2201st token', async () => {
      assert.equal(await springNFTInstance.determineEdition(2201), 4)
    })

    it('should return edition 4 for the 3000th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(3000), 4)
    })

    it('should return edition 4 for the 3500th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(3500), 4)
    })
  })

  describe('should return edition 5 for the 6th generation of 1600 tokens: 3501st - 5100th', () => {
    it('should return edition 5 for the 3501st token', async () => {
      assert.equal(await springNFTInstance.determineEdition(3501), 5)
    })

    it('should return edition 5 for the 4000th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(4000), 5)
    })

    it('should return edition 5 for the 5100th token', async () => {
      assert.equal(await springNFTInstance.determineEdition(5100), 5)
    })
  })

  describe('should return edition 15 for the 16th generation of 4600 tokens: 33001st - 37600th',
    () => {
      it('should return edition 15 for the 33001st token', async () => {
        assert.equal(await springNFTInstance.determineEdition(33001), 15)
      })

      it('should return edition 15 for the 37600th token', async () => {
        assert.equal(await springNFTInstance.determineEdition(37600), 15)
      })
    })

  describe('should return edition 16 for the 17th generation of 5000 tokens: 37601st - 42600th',
    () => {
      it('should return edition 16 for the 37601st token', async () => {
        assert.equal(await springNFTInstance.determineEdition(37601), 16)
      })

      it('should return edition 16 for the 42600th token', async () => {
        assert.equal(await springNFTInstance.determineEdition(42600), 16)
      })
    })

  describe('should return edition 17 for the 18th generation of 5000 tokens: 42601st - 47600th',
    () => {
      it('should return edition 17 for the 42601st token', async () => {
        assert.equal(await springNFTInstance.determineEdition(42601), 17)
      })

      it('should return edition 17 for the 47500th token', async () => {
        assert.equal(await springNFTInstance.determineEdition(47500), 17)
      })
    })

  describe(
    'should return edition 4999 for the 5000th generation of 5000 tokens: 24,952,601st - 24,957,600th',
    () => {
      it('should return edition 4999 for the 24,952,601st token', async () => {
        assert.equal(await springNFTInstance.determineEdition(24952601), 4999)
      })

      it('should return edition 4999 for the 24,957,600th token', async () => {
        assert.equal(await springNFTInstance.determineEdition(24957600), 4999)
      })
    })

  describe(
    'should return edition 5000 for all the tokens created after the 5000th generation with edition 4999',
    () => {
      it('should return edition 5000 for the 24,957,601st token', async () => {
        assert.equal(await springNFTInstance.determineEdition(24957601), 5000)
      })

      it('should return edition 5000 for the 24,962,602nd token', async () => {
        assert.equal(await springNFTInstance.determineEdition(24962602), 5000)
      })

      it('should return edition 5000 for the 987,654,321st token', async () => {
        assert.equal(await springNFTInstance.determineEdition(987654321), 5000)
      })
    })
})
