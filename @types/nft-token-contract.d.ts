import { ContractInstance, TransactionOptions } from "./contracts";

export interface NFTTokenContract extends ContractInstance {
  approve(
    approve: string,
    tokenId: number,
    options?: TransactionOptions
  ): Promise<void>

  balanceOf(owner: string): Promise<number>

  getApproved(tokenId: number): Promise<string>

  getOwnedTokenList(owner: string): Promise<number[]>

  transferFrom(
    fromAddress: string,
    toAddress: string,
    tokenId: number,
    options?: TransactionOptions
  ): Promise<void>
}
