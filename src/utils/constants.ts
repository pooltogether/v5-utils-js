const CHAIN_ID = {
  goerli: 5,
  sepolia: 11155111,
  mumbai: 80001,
};

export const TWAB_CONTROLLER_SUBGRAPH_URIS = {
  [CHAIN_ID.goerli]: `https://api.thegraph.com/subgraphs/name/pooltogether/v5-eth-goerli-twab-controller`,
  [CHAIN_ID.mumbai]: `https://api.thegraph.com/subgraphs/name/pooltogether/v5-polygon-mumbai-twab-control`,
  [CHAIN_ID.sepolia]: `https://api.studio.thegraph.com/query/41211/v5-twab-controller-eth-sepolia/v0.0.1`,
};

export const PRIZE_POOL_SUBGRAPH_URIS = {
  [CHAIN_ID.goerli]: `https://api.thegraph.com/subgraphs/name/pooltogether/v5-eth-goerli-prize-pool`,
  [CHAIN_ID.mumbai]: `https://api.thegraph.com/subgraphs/name/pooltogether/v5-polygon-mumbai-prize-pool`,
  [CHAIN_ID.sepolia]: `https://api.studio.thegraph.com/proxy/41211/v5-prize-pool-eth-sepolia/v0.0.1`,
};
