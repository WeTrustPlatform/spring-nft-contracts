export type Address = string;
export type TransactionOptions = Partial<Transaction>;

export interface ContractInstance {
  address: string;

  sendTransaction(options?: TransactionOptions): Promise<void>;
}

export interface Transaction {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: Address | ContractInstance;
  to: string | null;
  value: number;
  gasPrice: number;
  gas: number;
  input: string;
}
