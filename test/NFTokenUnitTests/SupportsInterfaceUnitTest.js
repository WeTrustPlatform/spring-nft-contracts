'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const ERC165Query = artifacts.require('./test/ERC165Query.sol')
const utils = require('../utils/utils')

let springNFTInstance;
let ERC165QueryInstance;

contract('NFToken: supportsInterface Unit Test', function(accounts) {
  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];

  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);
    ERC165QueryInstance = await ERC165Query.new();
  });

  it('checks that proper values are returned', async function() {
    let interfaceId = '0x780e9d63'
    let interfaceExists = await ERC165QueryInstance.doesContractImplementInterface.call(springNFTInstance.address, interfaceId)
    assert.equal(interfaceExists, true)
    interfaceId = '0x5b5e139f'
    interfaceExists = await ERC165QueryInstance.doesContractImplementInterface.call(springNFTInstance.address, interfaceId)
    assert.equal(interfaceExists, true)

    interfaceId = '0x80ac58cd'
    interfaceExists = await ERC165QueryInstance.doesContractImplementInterface.call(springNFTInstance.address, interfaceId)
    assert.equal(interfaceExists, true)
  });
});
