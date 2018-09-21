'use strict';

const springNFT = artifacts.require('SpringNFT.sol')
const utils = require('../utils/utils')

let springNFTInstance;

contract('SpringNFT: createNFT Unit Tests', function(accounts) {
  const recipientId = '0x1'
  const nftHolder = accounts[0]
  let tokenId = 0

  const wetrustAddress = accounts[7];
  const managerAddress = accounts[6];
  beforeEach(async function() {
    springNFTInstance = await springNFT.new(wetrustAddress, managerAddress);

    tokenId++;
    await springNFTInstance.addRecipient(recipientId, 'name', 'url', '0x0', {from: wetrustAddress})
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('checks that proper values were updated', async function() {
    const traitsToAdd = '0x0000000000000000000000000000000000002345000000000000000000000000'
    const typeToAdd = '0x82000000'

    tokenId++;
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, traitsToAdd, typeToAdd, {from: wetrustAddress})
    const NFT = await springNFTInstance.nft.call(tokenId)

    assert.equal(NFT[0], nftHolder) //owner
    assert.equal(NFT[2], traitsToAdd) // traits
    assert.equal(NFT[4], typeToAdd) // type
    assert.equal(NFT[3], 0) // edition
  });

  it('checks that Transfer event is emitted', async function() {
    const traitsToAdd = '0x0000000000000000000000000000000000002345000000000000000000000000'
    const typeToAdd = '0x82000000'

    tokenId++;
    const res = await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, traitsToAdd, typeToAdd, {from: wetrustAddress})
    assert.equal(res.logs[0].event, 'Transfer')
    assert.equal(res.logs[0].args._from, '0x0000000000000000000000000000000000000000')
    assert.equal(res.logs[0].args._to, '0x627306090abab3a6e1400e9345bc60c78a8bef57')
    assert.equal(res.logs[0].args._tokenId.toNumber(), '4')
  });

  it('throws if tokenId already exists', async function() {
    await utils.assertRevert(springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01'))
    tokenId++;
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('throws if msg.sender is not wetrust', async function() {
    tokenId++;
    await utils.assertRevert(springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01'))
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('throws if recipient does not exist', async function() {
    tokenId++;
    await utils.assertRevert(springNFTInstance.createNFT(tokenId, nftHolder, '0x2', '0x01', '0x01'))
    await springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress})
  });

  it('throws if contract is in paused state', async function() {
    tokenId++;
    await springNFTInstance.setPaused(true, {from: managerAddress})
    await utils.assertRevert(springNFTInstance.createNFT(tokenId, nftHolder, recipientId, '0x01', '0x01', {from: wetrustAddress}))
  });
});
