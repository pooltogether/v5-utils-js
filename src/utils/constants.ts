const CHAIN_ID = {
  goerli: 5,
  mumbai: 80001
};

export const TWAB_CONTROLLER_SUBGRAPH_URIS = {
  [CHAIN_ID.goerli]: `https://api.thegraph.com/subgraphs/name/pooltogether/v5-eth-goerli-twab-controller`,
  [CHAIN_ID.mumbai]: `https://api.thegraph.com/subgraphs/name/pooltogether/v5-polygon-mumbai-twab-controller`
};
