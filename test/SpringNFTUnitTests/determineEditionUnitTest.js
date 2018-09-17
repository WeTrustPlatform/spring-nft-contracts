'use strict';

const springNFT = artifacts.require('SpringNFT.sol')

let springNFTInstance;

contract('SpringNFT: determineEdition Unit Tests', function(accounts) {
  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);
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
    let expectedEdition = 15
    let edition = await springNFTInstance.determineEdition.call(37600)
    assert.equal(edition, expectedEdition)

    expectedEdition = 16
    edition = await springNFTInstance.determineEdition.call(37601)
    assert.equal(edition, expectedEdition)

    edition = await springNFTInstance.determineEdition.call(42600)
    assert.equal(edition, expectedEdition)

    expectedEdition = 17
    edition = await springNFTInstance.determineEdition.call(42601)
    assert.equal(edition, expectedEdition)
  });

  it('checks that max edition is 5000', async function() {
    let inputToTest = 987654321;
    let expectedEdition = 5000
    let edition = await springNFTInstance.determineEdition.call(inputToTest)
    assert.equal(edition, expectedEdition)

    edition = await springNFTInstance.determineEdition.call(inputToTest + 5001) // add 5001 because max edition size is 5000
    assert.equal(edition, expectedEdition)
  });
});
