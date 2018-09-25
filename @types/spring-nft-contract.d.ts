import NFTTokenContract from './nft-token-contract'

export interface SpringNFTContract extends NFTTokenContract {
  addRecipient(
    recipientId: string,
    name: string,
    url: string,
    owner: string,
    options: object
  ): Promise<void>;

  createNFT(
    tokenId: number,
    receiver: string,
    recipientId: string,
    traits: string,
    nftType: string,
    options: object
  ): Promise<number>;
}
