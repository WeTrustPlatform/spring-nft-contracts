'use strict';

let assert = require('chai').assert;
let ethUtils = require('ethereumjs-util');
let web3Utils = require('web3-utils');
let consts = require('./consts.js');

module.exports = {
  createMsgHash: function(nftType, traits, recipientId, uinqueToken) {

    return web3Utils.soliditySha3(
      { t: 'bytes', v: '0x19' },
      { t: 'bytes4', v: nftType },
      { t: 'bytes32', v: traits },
      { t: 'bytes32', v: recipientId },
      { t: 'bytes32', v: uinqueToken })
      .substring(2)
  },

  createSignedMsg: function(arryOfUserIndexes, msgHash) {

    let messageSignatures = '0x';
    for (let i = 0; i < arryOfUserIndexes.length; i++) {
      const sig = ethUtils.ecsign(
        Buffer.from(msgHash, 'hex'),
        Buffer.from(consts.PRIVATE_KEYS[arryOfUserIndexes[i]], 'hex')
      );
      messageSignatures += sig.r.toString('hex') + sig.s.toString('hex') + sig.v.toString(16)
    }

    return messageSignatures;
  },

  assertRevert: function(promise, err) {
    return promise
      .then(function() {
        assert.isNotOk(true, err);
      })
      .catch(function(e) {
        assert.include(
          e.message,
          'revert',
          "contract didn't throw as expected"
        );
      });
  },
};