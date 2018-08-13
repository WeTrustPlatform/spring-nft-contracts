'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: determineEdition Unit Tests', function(accounts) {
  const wetrustAddress = accounts[7];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress);
  });

  it('returns correct editions', async function() {
    let expectedEdition = 0
    let edition = await springNFTInstance.determineEdition.call(1)
    assert.equal(edition, expectedEdition)

    edition = await springNFTInstance.determineEdition.call(100)
    assert.equal(edition, expectedEdition)

    expectedEdition = 1
    edition = await springNFTInstance.determineEdition.call(101)
    assert.equal(edition, expectedEdition)

    expectedEdition = 2
    edition = await springNFTInstance.determineEdition.call(501)
    assert.equal(edition, expectedEdition)

    expectedEdition = 3
    edition = await springNFTInstance.determineEdition.call(1201)
    assert.equal(edition, expectedEdition)
  });

  it('checks that max edition size is 5000', async function() {
    let expectedEdition = 17
    let edition = await springNFTInstance.determineEdition.call(47500)
    assert.equal(edition, expectedEdition)

    expectedEdition = 18
    edition = await springNFTInstance.determineEdition.call(52500)
    assert.equal(edition, expectedEdition)
  });
});
