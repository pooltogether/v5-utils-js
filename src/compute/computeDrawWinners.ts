import { Provider } from '@ethersproject/providers';

import { getSubgraphVaults, populateSubgraphVaultAccounts } from '../utils/getSubgraphVaults';
import { getSubgraphClaimedPrizes } from '../utils/getSubgraphClaimedPrizes';
import { getWinnersClaims } from '../utils/getWinnersClaims';
import { ContractsBlob, Claim, ClaimedPrize } from '../types';

/**
 * Finds out which of the accounts in each vault are winners for the last draw and formats
 * them into an array Claim objects
 *
 * @returns {Promise} Promise of an array of Claim objects
 */
export async function computeDrawWinners(
  provider: Provider,
  contracts: ContractsBlob,
  chainId: number,
  tiersArray: number[],
  drawId: number,
  filterAutoClaimDisabled?: boolean,
): Promise<Claim[]> {
  let vaults = await getSubgraphVaults(chainId);
  if (vaults.length === 0) {
    throw new Error('Claimer: No vaults found in subgraph');
  }

  // Page through and concat all accounts for all vaults
  vaults = await populateSubgraphVaultAccounts(chainId, vaults);

  let claims: Claim[] = await getWinnersClaims(provider, contracts, vaults, tiersArray, {
    filterAutoClaimDisabled,
  });

  claims = await flagClaimed(chainId, claims, drawId);

  return claims;
}

const flagClaimed = async (chainId: number, claims: Claim[], drawId: number): Promise<Claim[]> => {
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
