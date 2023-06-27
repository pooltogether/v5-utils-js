import { Provider } from '@ethersproject/providers';
import { ContractCallContext } from 'ethereum-multicall';

import { MulticallResults, ContractsBlob, PrizePoolInfo, TierPrizeAmounts } from '../types';
import { getComplexMulticallResults } from './multicall';

/**
 * Returns tier prize amounts
 * @param readProvider a read-capable provider for the chain that should be queried
 * @param contracts blob of contracts to pull PrizePool abi/etc from
 * @param prizePoolInfo PrizePoolInfo type, data about previous draw prizes and tiers
 * @returns
 */
export const getTierPrizeAmounts = async (
  readProvider: Provider,
  contracts: ContractsBlob,
  prizePoolInfo: PrizePoolInfo,
): Promise<TierPrizeAmounts> => {
  const prizePoolContractBlob = contracts.contracts.find(
    (contract) => contract.type === 'PrizePool',
  );
  if (!prizePoolContractBlob) {
    throw new Error('Contracts: No prize pool found in provided contracts blob');
  }

  const prizePoolAddress: string | undefined = prizePoolContractBlob?.address;

  const calls: ContractCallContext['calls'] = [];

  prizePoolInfo.tiersRangeArray.forEach((tierNum) => {
    calls.push({
      reference: `${tierNum}`,
      methodName: 'calculatePrizeSize',
      methodParameters: [tierNum],
    });
  });

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

  return getTierAmounts(prizePoolAddress, multicallResults);
};

const getTierAmounts = (
  prizePoolAddress: string,
  multicallResults: MulticallResults,
): TierPrizeAmounts => {
  const amounts: TierPrizeAmounts = {};

  Object.entries(multicallResults[prizePoolAddress]).forEach((tierResult) => {
    const [key, value] = tierResult;
    amounts[key] = value[0];
  });

  return amounts;
};
