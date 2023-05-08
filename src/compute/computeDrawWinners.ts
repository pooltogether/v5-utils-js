import { BigNumber } from "@ethersproject/bignumber";

import { computePicksPrizes } from "./computePicksPrizes";
import { DrawResults } from "../types";
import { updateDrawResultsWithWinningPicks } from "../utils";

export function computeDrawWinners(chainId: number, prizePool: string): DrawResults {
  const pickPrizes = computePicksPrizes(chainId, prizePool);
  return updateDrawResultsWithWinningPicks(pickPrizes, createDrawResultsObject(draw.drawId), picks);
}
