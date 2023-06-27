// getPrizePoolInfo.ts

// const grandPrizePeriod = await prizePoolContract.grandPrizePeriodDraws();

// const drawDuration = getDrawDuration(i, numberOfTiers, grandPrizePeriod);
// prizePoolInfo.tierDrawDurations[i.toString()] = drawDuration;

// // const drawDuration = fromSD59x18(sd(1e18).div(tierOdds).ceil());
// const getDrawDuration = (tier: number, numberOfTiers: number, grandPrizePeriod: number) => {
//   console.log(``);
//   console.log(``);
//   console.log(``);
//   console.log(`getTierOdds(${tier}, ${numberOfTiers}, ${grandPrizePeriod})`);
//   console.log(``);
//   const tierOdds = getTierOdds(tier, numberOfTiers, grandPrizePeriod);
//   console.log('');
//   console.log('tierOdds:');
//   console.log(tierOdds.toString());
//   return Math.ceil(Number(ethers.constants.WeiPerEther.div(tierOdds)));
// };

// // SD59x18 _k = sd(1).div(
// //     sd(int256(uint256(grandPrizePeriod)))
// // ).ln().div(
// //     sd((-1 * int256(numberOfTiers) + 1))
// // );
// // return E.pow(_k.mul(sd(int256(_tier) - (int256(_numberOfTiers) - 1))));
// export const getTierOdds = (
//   tier: number,
//   numberOfTiers: number,
//   grandPrizePeriod: number,
// ): BigNumber => {
//   const numberOfTiersBN = ethers.constants.WeiPerEther.mul(numberOfTiers);

//   const _k = ethers.constants.WeiPerEther.div(grandPrizePeriod).div(
//     numberOfTiersBN.mul('-1').add(1),
//   );
//   console.log('_k');
//   console.log(_k.toString());

//   const E = BigNumber.from('2718281828459045235');
//   console.log(E);

//   const exponent = 3;
//   // const exponent = _k * tier - numberOfTiers - 1;

//   return E.pow(exponent);
// };

//

//getWinnersClaims.ts
// address _vault, address _user, uint256 _drawDuration
// const drawDuration = prizePoolInfo.tierDrawDurations[tierNum];
// toQuery[key] = prizePoolContract.getVaultUserBalanceAndTotalSupplyTwab(
//   vault.id,
//   address,
//   drawDuration,
// );

// address _vault, address _user, uint256 _drawDuration
// console.log('twab');
// console.log(twab);
// twab.userTwab
// twab.vaultTwabTotalSupply
// (uint256 _userTwab, uint256 _vaultTwabTotalSupply)

// getVaultPortions.ts

// import { ethers } from 'ethers';
// import { Provider } from '@ethersproject/providers';

// import { ContractsBlob, Vault, PrizePoolInfo } from '../types';
// import { findPrizePoolInContracts } from '../utils';

// // OPTIMIZE: Use multicall reads?
// export const getVaultPortions = async (
//   readProvider: Provider,
//   contracts: ContractsBlob,
//   vaults: Vault[],
//   tiersArray: number[],
//   prizePoolInfo: PrizePoolInfo,
// ): Promise<Vault[]> => {
//   const prizePoolContractBlob = findPrizePoolInContracts(contracts);
//   const prizePoolAddress: string | undefined = prizePoolContractBlob?.address;

//   const prizePoolContract = new ethers.Contract(
//     prizePoolAddress,
//     prizePoolContractBlob.abi,
//     readProvider,
//   );

//   // console.log('vaults');
//   // console.log(vaults);
//   for (let i = 0; i < vaults.length; i++) {
//     const vault = vaults[i];
//     const vaultAddress = vault.id;
//     vault.tierInfo = {};

//     for (let tier of tiersArray) {
//       // const grandPrizePeriodDraws = await prizePoolContract.grandPrizePeriodDraws();
//       // const vaultPortion = await prizePoolContract.getVaultPortion(vault, tier);
//       const vaultPortion = { vaultPortion: 1 };

//       vault.tierInfo[tier] = vaultPortion;
//       // vaults[i][tier] = { vaultPortion };
//     }
//   }
//   // console.log(vaults);

//   return vaults;
// };

// types

// export interface TierInfo {
//   tier?: number;
//   vaultPortion?: any;
// }

// tierInfo: {
//     [tier: number]: {
//       // TODO: type this:
//       vaultPortion: any;
//     };
//   };

// tierDrawDurations: {
//   [tierNum: string]: number;
// };
