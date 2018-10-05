import NFTTokenContract from './nft-token-contract'
import { TransactionOptions } from "./contracts"

export interface SpringNFTContract extends NFTTokenContract {
  addArtistSignature(
    nftId: number,
    artistSignature: string,
    options?: TransactionOptions
  ): Promise<void>;

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

  createRedeemMessageHash(
    tokenId: number,
    nftType: string,
    traits: string,
    recipientId: string
  ): Promise<string>;

  getUpdateCount(recipientId: string): Promise<number>;

  nftArtistSignature(tokenId: number): Promise<string>;

  recipients(recipientId: string): Promise<(string | object | number)[]>;

  recipientUpdates(recipientId: string, index: number): Promise<string[]>;

  redeemToken(signedMessage: string, options?: TransactionOptions): Promise<void>;

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
