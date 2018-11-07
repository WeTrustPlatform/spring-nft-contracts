const path = require('path');
const fs = require('fs');

const SpringNFTContract = path.resolve(__dirname, './build/contracts/SpringNFT.json');

const {
  abi, bytecode, sourceMap, source, compiler, schemaVersion,
} = require(SpringNFTContract);

const contractContent = {
  abi, bytecode, sourceMap, source, compiler, schemaVersion,
};

fs.writeFileSync('./.exported.js', `module.exports = ${JSON.stringify(contractContent)};`, 'utf-8');
