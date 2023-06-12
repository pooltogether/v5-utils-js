import { Provider } from '@ethersproject/providers';

import { getSubgraphVaults, populateSubgraphVaultAccounts } from '../utils/getSubgraphVaults';
import { getWinnersClaims } from '../utils/getWinnersClaims';
import { ContractsBlob, Claim } from '../types';

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
): Promise<Claim[]> {
  let vaults = await getSubgraphVaults(chainId);
  if (vaults.length === 0) {
    throw new Error('Claimer: No vaults found in subgraph');
  }

  // Page through and concat all accounts for all vaults
  vaults = await populateSubgraphVaultAccounts(chainId, vaults);

  const claims: Claim[] = await getWinnersClaims(provider, contracts, vaults, tiersArray, {
    filterAutoClaimDisabled: false,
  });

  return claims;
}
