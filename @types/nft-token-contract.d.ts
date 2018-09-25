export interface NFTTokenContract {
  getApproved(tokenId: number): Promise<string>
}
