import NFTTokenContract from './nft-token-contract'
import { TransactionOptions } from "./contracts";

export interface SpringNFTContract extends NFTTokenContract {
  addRecipient(
    recipientId: string,
    name: string,
    url: string,
    owner: string,
    options?: TransactionOptions
  ): Promise<void>;

  createNFT(
    tokenId: number,
    receiver: string,
    recipientId: string,
    traits: string,
    nftType: string,
    options?: TransactionOptions
  ): Promise<number>;
}
