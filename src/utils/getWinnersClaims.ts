import { Provider } from '@ethersproject/providers';
import { ContractCallContext } from 'ethereum-multicall';
import * as _ from 'lodash';

import { MulticallResults, ContractData, Claim, ContractsBlob, Vault } from '../types';
import { getComplexMulticallResults } from './multicall';

interface GetWinnersClaimsOptions {
  filterAutoClaimDisabled: boolean;
}

/**
 * Returns claims
 * @param readProvider a read-capable provider for the chain that should be queried
 * @param contracts blob of contracts to pull PrizePool abi/etc from
 * @param vaults vaults to query through
 * @param tiersArray an easily iterable range of numbers for each tier available (ie. [0, 1, 2])
 * @returns
 */
export const getWinnersClaims = async (
  readProvider: Provider,
  contracts: ContractsBlob,
  vaults: Vault[],
  tiersArray: number[],
  options: GetWinnersClaimsOptions,
): Promise<Claim[]> => {
  const prizePoolContractBlob = findPrizePoolInContracts(contracts);

  const calls: ContractCallContext['calls'] = [];

  // OPTIMIZE: Make sure user has balance before adding them to the read multicall
  vaults.forEach((vault) => {
    vault.accounts.forEach((account) => {
      const address = account.id.split('-')[1];

      tiersArray.forEach((tierNum) => {
        calls.push({
          reference: `${vault.id}-${address}-${tierNum}`,
          methodName: 'isWinner',
          methodParameters: [vault.id, address, tierNum],
        });
      });
    });
  });

  const prizePoolAddress: string | undefined = prizePoolContractBlob?.address;

  const queries: ContractCallContext[] = [
    {
      reference: prizePoolAddress,
      contractAddress: prizePoolAddress,
      abi: prizePoolContractBlob.abi,
      calls,
    },
  ];

  const multicallResults: MulticallResults = await getComplexMulticallResults(
    readProvider,
    queries,
  );

  // Builds the array of claims
  let claims = getClaims(prizePoolAddress, multicallResults);

  // Filters out claims that don't have autoClaim enabled
  if (options.filterAutoClaimDisabled) {
    claims = await filterAutoClaimDisabledForClaims(readProvider, contracts, claims);
  }

  // TODO: Sounds like this won't be a feature on mainnet so going to punt on it for now:
  //
  // Filters out claims from vaults where the Claimer contract isn't the Vault.claimer()
  // (see more on this in the Vault.sol contract guards for `claimPrize()`)
  // if (options.filterNonClaimerVaults) {
  //   claims = filterVaultIsNotClaimer(claims);
  // }

  return claims;
};

const getClaims = (prizePoolAddress: string, multicallResults: MulticallResults): Claim[] => {
  const claims: Claim[] = [];

  Object.entries(multicallResults[prizePoolAddress]).forEach((vaultUserTierResult) => {
    const key = vaultUserTierResult[0];
    const value = vaultUserTierResult[1];
    const isWinner = value[0];

    const [vault, winner, tier] = key.split('-');

    if (isWinner) {
      claims.push({ vault, tier: Number(tier), winner });
    }
  });

  return claims;
};

const filterAutoClaimDisabledForClaims = async (
  readProvider: Provider,
  contracts: ContractsBlob,
  claims: Claim[],
): Promise<Claim[]> => {
  if (claims.length === 0) {
    return claims;
  }

  const claimsGroupedByVault = _.groupBy(claims, (claim: Claim) => claim.vault);

  // Compile list of Vault contracts to query and calls within
  const queries: ContractCallContext[] = [];
  for (const vault of Object.entries(claimsGroupedByVault)) {
    const [key, value] = vault;
    const vaultAddress = key;
    const vaultClaims = value;

    const vaultContractBlob = findVaultContractBlobInContracts(contracts, vaultAddress);

    const calls: ContractCallContext['calls'] = [];
    for (const claim of vaultClaims) {
      const { winner, tier } = claim;

      calls.push({
        reference: `${vaultAddress}-${winner}-${tier}`,
        methodName: 'autoClaimDisabled',
        methodParameters: [winner],
      });
    }

    queries.push({
      reference: vaultAddress,
      contractAddress: vaultAddress,
      abi: vaultContractBlob.abi,
      calls,
    });
  }

  const multicallResults: MulticallResults = await getComplexMulticallResults(
    readProvider,
    queries,
  );

  // Actually filter the original claims with the claims where auto-claim has been disabled
  claims = claims.filter((claim: Claim) => {
    const { vault, winner, tier } = claim;
    const compositeKey = `${vault}-${winner}-${tier}`;

    return !multicallResults[vault][compositeKey][0];
  });

  return claims;
};

const findPrizePoolInContracts = (contracts: ContractsBlob) => {
  const prizePoolContractBlob = contracts.contracts.find(
    (contract) => contract.type === 'PrizePool',
  );
  if (!prizePoolContractBlob) {
    throw new Error('Contracts: No prize pool found in provided contracts blob');
  }

  return prizePoolContractBlob;
};

const findVaultContractBlobInContracts = (contracts: ContractsBlob, vaultAddress: string) => {
  const vaultContractBlob = contracts.contracts.find(
    (contract: ContractData) =>
      contract.type === 'Vault' && contract.address.toLowerCase() === vaultAddress.toLowerCase(),
  );
  if (!vaultContractBlob) {
    throw new Error(
      `Contracts: No vault found in provided contracts blob with address: ${vaultAddress}`,
    );
  }

  return vaultContractBlob;
};
