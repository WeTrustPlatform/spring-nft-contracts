import * as Web3 from 'web3'
import { SpringNFTContract } from 'spring-nft-contract'
import { ERC165QueryInstance } from "./erc165-query-instance"

declare global {
  function contract(name: string, test: ContractTest): void;

  var artifacts: Artifacts;
  var web3: Web3;
  var assert: Chai.AssertStatic;
}

declare type ContractTest = (accounts: string[]) => void;

interface Contract<T> {
  "new"(...args: any[]): Promise<T>;

  deployed(): Promise<T>;

  at(address: string): T;
}

interface Artifacts {
  require(name: 'SpringNFT.sol'): Contract<SpringNFTContract>;

  require(name: './test/ERC721ReceiverTest.sol'): Contract<void>

  require(name: './test/EmptyContract.sol'): Contract<void>

  require(name: './test/ERC165Query.sol'): Contract<ERC165QueryInstance>
}
