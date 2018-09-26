import { ContractInstance, TransactionOptions } from "./contracts";

export interface NFTTokenContract extends ContractInstance {
  approve(approve: string, tokenId: number, options?: TransactionOptions): Promise<void>

  getApproved(tokenId: number): Promise<string>
}
