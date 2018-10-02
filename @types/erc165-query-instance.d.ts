import { ContractInstance } from "./contracts";

export interface ERC165QueryInstance extends ContractInstance {
  doesContractImplementInterface(address: string, interfaceId: string): Promise<boolean>
}