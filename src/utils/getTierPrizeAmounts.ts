import { Provider } from '@ethersproject/providers';
import { ContractCallContext } from 'ethereum-multicall';

import { MulticallResults, ContractsBlob, Amounts } from '../types';
import { getComplexMulticallResults } from './multicall';

/**
 * Returns tier prize amounts
 * @param readProvider a read-capable provider for the chain that should be queried
 * @param contracts blob of contracts to pull PrizePool abi/etc from
 * @param tiersArray an easily iterable range of numbers for each tier available (ie. [0, 1, 2])
 * @returns
 */
export const getTierPrizeAmounts = async (
  readProvider: Provider,
  contracts: ContractsBlob,
  tiersArray: number[],
): Promise<Amounts> => {
  const prizePoolContractBlob = contracts.contracts.find(
    (contract) => contract.type === 'PrizePool',
  );
  if (!prizePoolContractBlob) {
    throw new Error('Contracts: No prize pool found in provided contracts blob');
  }

  const prizePoolAddress: string | undefined = prizePoolContractBlob?.address;

  const calls: ContractCallContext['calls'] = [];

  tiersArray.forEach((tierNum) => {
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

const getTierAmounts = (prizePoolAddress: string, multicallResults: MulticallResults): Amounts => {
  const amounts: Amounts = {};

  Object.entries(multicallResults[prizePoolAddress]).forEach((tierResult) => {
    const [key, value] = tierResult;
    amounts[key] = value[0];
  });

  return amounts;
};
