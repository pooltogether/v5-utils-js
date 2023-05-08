export interface TokenData {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  extensions: {
    underlyingAsset: {
      address: string;
      symbol: string;
      name: string;
    };
  };
}

export interface ContractData {
  address: string;
  chainId: number;
  type: string;
  abi: any;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens?: TokenData[];
}

export interface ContractsBlob {
  name: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  timestamp: string;
  contracts: ContractData[];
}

export interface Vault {
  id: string;
  accounts: VaultAccount[];
}

export interface VaultAccount {
  id: string;
}

export interface TiersContext {
  numberOfTiers: number;
  rangeArray: number[];
}

export interface ClaimPrizeContext {
  drawId: string;
  tiers: TiersContext;
}

export interface GetClaimerProfitablePrizeTxsParams {
  chainId: number;
  feeRecipient: string;
}

export interface Claim {
  vault: string;
  winner: string;
  tier: number;
}

export interface PrizeClaimerConfigParams {
  chainId: number;
}

export interface MulticallResults {
  [contractAddress: string]: {
    [reference: string]: any[];
  };
}
