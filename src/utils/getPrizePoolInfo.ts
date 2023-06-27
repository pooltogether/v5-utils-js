import { ethers, BigNumber } from 'ethers';
import { Provider } from '@ethersproject/providers';

import { ContractsBlob, PrizePoolInfo } from '../types';
import { findPrizePoolInContracts } from '../utils';

/**
 * ...
 * @param readProvider a read-capable provider for the chain that should be queried
 * @param chainId chain #
 * @param contracts blob of contracts to pull PrizePool abi/etc from
 * @returns
 */
export const getPrizePoolInfo = async (
  readProvider: Provider,
  contracts: ContractsBlob,
): Promise<PrizePoolInfo> => {
  const prizePoolInfo: PrizePoolInfo = {
    drawId: -1,
    numberOfTiers: -1,
    tiersRangeArray: [],
    tierPrizeCounts: {},
    tierPrizeAmounts: {},
  };

  const prizePoolContractBlob = findPrizePoolInContracts(contracts);
  const prizePoolAddress: string | undefined = prizePoolContractBlob?.address;

  // @ts-ignore Provider == BaseProvider
  const prizePoolContract = new ethers.Contract(
    prizePoolAddress,
    prizePoolContractBlob.abi,
    readProvider,
  );

  // Draw ID
  prizePoolInfo.drawId = await prizePoolContract.getLastCompletedDrawId();

  // Number of Tiers
  prizePoolInfo.numberOfTiers = await prizePoolContract.numberOfTiers();

  // Tier Prize Counts
  for (let i = 0; i < prizePoolInfo.numberOfTiers; i++) {
    const prizeCount = await prizePoolContract.getTierPrizeCount(i);
    prizePoolInfo.tierPrizeCounts[i.toString()] = prizeCount;
  }

  // Tiers Range Array
  const tiersRangeArray = Array.from(
    { length: prizePoolInfo.numberOfTiers },
    (value, index) => index,
  );
  // const tiersRangeArray = Array.from(
  //   { length: prizePoolInfo.numberOfTiers + 1 },
  //   (value, index) => index,
  // );
  prizePoolInfo.tiersRangeArray = tiersRangeArray;

  return prizePoolInfo;
};
