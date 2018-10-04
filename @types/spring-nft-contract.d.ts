import NFTTokenContract from './nft-token-contract'
import { TransactionOptions } from "./contracts"

export interface SpringNFTContract extends NFTTokenContract {
  addRecipient(
    recipientId: string,
    name: string,
    url: string,
    owner: string,
    options?: TransactionOptions
  ): Promise<void>;

  addRecipientUpdate(
    recipientId: string,
    updateId: string,
    options?: TransactionOptions
  ): Promise<void>;

  changeWeTrustSigner(newAddress: string, options?: TransactionOptions): Promise<void>;

  createNFT(
    tokenId: number,
    receiver: string,
    recipientId: string,
    traits: string,
    nftType: string,
    options?: TransactionOptions
  ): Promise<number>;

  getUpdateCount(recipientId: string): Promise<number>;

  recipients(recipientId: string): Promise<(string | object | number)[]>;

  recipientUpdates(recipientId: string, index: number): Promise<string[]>;

  setPaused(paused: boolean, options?: TransactionOptions): Promise<void>;

  updateRecipientInfo(
    recipientId: string,
    name: string,
    url: string,
    address: string,
    options?: TransactionOptions
  ): Promise<void>;

  wetrustSigner(): Promise<string>;
}
