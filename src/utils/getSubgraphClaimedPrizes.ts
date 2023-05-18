import { gql, GraphQLClient } from "graphql-request";

import { PRIZE_POOL_SUBGRAPH_URIS } from "./constants";
import { ClaimedPrize } from "../types";

/**
 * Subgraphs to query for depositors
 */
export const getPrizePoolSubgraphUri = (chainId: number) => {
  return PRIZE_POOL_SUBGRAPH_URIS[chainId];
};

export const getPrizePoolSubgraphClient = (chainId: number) => {
  const uri = getPrizePoolSubgraphUri(chainId);

  return new GraphQLClient(uri);
};

/**
 * Pulls from the subgraph all of the claimed prizes for a specific draw
 *
 * @returns {Promise} Promise of an array of ClaimedPrize objects
 */
export const getSubgraphClaimedPrizes = async (
  chainId: number,
  drawId: string
): Promise<ClaimedPrize[]> => {
  const client = getPrizePoolSubgraphClient(chainId);

  const query = drawQuery();
  const variables = { id: drawId };

  // @ts-ignore: ignore types from GraphQL client lib
  const claimedPrizesResponse: any = await client.request(query, variables).catch((e) => {
    console.error(e.message);
    throw e;
  });

  return claimedPrizesResponse?.draw?.prizeClaims || [];
};

const drawQuery = () => {
  return gql`
    query drawQuery($id: String!) {
      draw(id: $id) {
        id
        prizeClaims {
          id
          payout
          fee
          timestamp
        }
      }
    }
  `;
};
