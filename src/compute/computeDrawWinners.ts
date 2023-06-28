import { Provider } from '@ethersproject/providers';

import { getSubgraphVaults, populateSubgraphVaultAccounts } from '../utils/getSubgraphVaults';
import { getSubgraphClaimedPrizes } from '../utils/getSubgraphClaimedPrizes';
import { getWinnersClaims } from '../utils/getWinnersClaims';
import { getPrizePoolInfo } from '../utils/getPrizePoolInfo';
import { ContractsBlob, Claim, ClaimedPrize, PrizePoolInfo } from '../types';

/**
 * Finds out which of the accounts in each vault are winners for the last draw and formats
 * them into an array Claim objects
 *
 * @returns {Promise} Promise of an array of Claim objects
 */
export async function computeDrawWinners(
  readProvider: Provider,
  contracts: ContractsBlob,
  chainId: number,
  filterAutoClaimDisabled?: boolean,
): Promise<Claim[]> {
  // #1. Collect prize pool info
  const prizePoolInfo: PrizePoolInfo = await getPrizePoolInfo(readProvider, contracts);

  // #2. Collect all vaults
  let vaults = await getSubgraphVaults(chainId);
  if (vaults.length === 0) {
    throw new Error('Claimer: No vaults found in subgraph');
  }

  // #3. Page through and concat all accounts for all vaults
  vaults = await populateSubgraphVaultAccounts(chainId, vaults);

  // #4. Determine winners for last draw
  let claims: Claim[] = await getWinnersClaims(readProvider, prizePoolInfo, contracts, vaults, {
    filterAutoClaimDisabled,
  });

  // #5. Cross-reference prizes claimed subgraph to flag if a claim has been claimed or not
  claims = await flagClaimed(chainId, claims, prizePoolInfo);

  return claims;
}

const flagClaimed = async (
  chainId: number,
  claims: Claim[],
  prizePoolInfo: PrizePoolInfo,
): Promise<Claim[]> => {
  const drawId = prizePoolInfo.drawId;
  const claimedPrizes: ClaimedPrize[] = await getSubgraphClaimedPrizes(chainId, drawId);

  const formattedClaimedPrizes = claimedPrizes.map((claimedPrize) => {
    // From Subgraph, `id` is:
    // vault ID + winner ID + draw ID + tier
    const [vault, winner, draw, tier] = claimedPrize.id.split('-');
    return `${vault}-${winner}-${tier}`;
  });

  for (let claim of claims) {
    claim.claimed = formattedClaimedPrizes.includes(claimCompositeKey(claim));
  }

  return claims;
};

const claimCompositeKey = (claim: Claim) => `${claim.vault}-${claim.winner}-${claim.tier}`;
