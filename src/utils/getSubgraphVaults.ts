import { gql, GraphQLClient } from "graphql-request";

import { TWAB_CONTROLLER_SUBGRAPH_URIS } from "./constants";
import { Vault } from "../types";

/**
 * Subgraphs to query for depositors
 */
export const getTwabControllerSubgraphUri = (chainId: number) => {
  return TWAB_CONTROLLER_SUBGRAPH_URIS[chainId];
};

export const getTwabControllerSubgraphClient = (chainId: number) => {
  const uri = getTwabControllerSubgraphUri(chainId);

  return new GraphQLClient(uri);
};

/**
 * Pulls from the subgraph all of the vaults and their associated accounts
 *
 * @returns {Promise} Promise of an array of Vault objects
 */
export const getSubgraphVaults = async (chainId: number): Promise<Vault[]> => {
  const client = getTwabControllerSubgraphClient(chainId);

  const query = vaultsQuery();

  // @ts-ignore: ignore types from GraphQL client lib
  const vaultsResponse: any = await client.request(query).catch((e) => {
    console.error(e.message);
    throw e;
  });

  const vaults = vaultsResponse?.vaults;

  return vaults;
};

const vaultsQuery = () => {
  return gql`
    {
      vaults {
        id
        accounts {
          id
        }
      }
    }
  `;
};
