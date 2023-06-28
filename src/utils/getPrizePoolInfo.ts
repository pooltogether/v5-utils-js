import { ethers, BigNumber } from 'ethers';
import { Provider } from '@ethersproject/providers';

import { ContractsBlob, PrizePoolInfo, TierPrizeData } from '../types';
import { findPrizePoolInContracts } from '../utils';

/**
 * Gather information about the given prize pool's previous drawId and tiers
 * @param readProvider a read-capable provider for the chain that should be queried
 * @param contracts blob of contracts to pull PrizePool abi/etc from
 * @returns {Promise} Promise with PrizePoolInfo
 */
export const getPrizePoolInfo = async (
  readProvider: Provider,
  contracts: ContractsBlob,
): Promise<PrizePoolInfo> => {
  const prizePoolInfo: PrizePoolInfo = {
    drawId: -1,
    numberOfTiers: -1,
    tiersRangeArray: [],
    tierPrizeData: {},
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

  // Tiers Range Array
  const tiersRangeArray = Array.from(
    { length: prizePoolInfo.numberOfTiers },
    (value, index) => index,
  );
  prizePoolInfo.tiersRangeArray = tiersRangeArray;

  // Tier Data
  for (let tierNum = 0; tierNum < prizePoolInfo.numberOfTiers; tierNum++) {
    const tier: TierPrizeData = (prizePoolInfo.tierPrizeData[tierNum.toString()] = {
      count: -1,
      rangeArray: [],
      amount: BigNumber.from(0),
    });

    const prizeCount = await prizePoolContract.getTierPrizeCount(tierNum);
    tier.count = prizeCount;

    // Prize Indices Range Array
    tier.rangeArray = buildPrizeIndicesRangeArray(tier);

    // Prize Amount
    tier.amount = await prizePoolContract.getTierPrizeSize(tierNum);
  }

  return prizePoolInfo;
};

const buildPrizeIndicesRangeArray = (tier: TierPrizeData): number[] => {
  let array: number[] = [];

  const tierPrizeCount = tier.count;
  array = Array.from({ length: tierPrizeCount }, (value, index) => index);

  return array;
};
