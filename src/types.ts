import { BigNumber } from "@ethersproject/bignumber";

//////////////////////////// Derived from contracts ////////////////////////////

export type NormalizedUserBalance = {
  address: string;
  normalizedBalance: BigNumber;
};
