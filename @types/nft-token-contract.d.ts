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

  isApprovedForAll(owner: string, operator: string): Promise<boolean>

  ownerOf(tokenId: number): Promise<string>

  setApprovalForAll(
    operator: string,
    approved: boolean,
    options?: TransactionOptions
  ): Promise<void>

  safeTransferFrom(
    from: string,
    to: string,
    tokenId: number,
    options?: TransactionOptions
  ): Promise<void>

  tokenByIndex(index: number): Promise<number>

  tokenOfOwnerByIndex(owner: string, index: number): Promise<number>

  tokenURI(tokenId: number): Promise<string>

  totalSupply(): Promise<number>

  transferFrom(
    fromAddress: string,
    toAddress: string,
    tokenId: number,
    options?: TransactionOptions
  ): Promise<void>
}
