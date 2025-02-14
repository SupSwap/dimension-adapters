import fetchURL from "../../utils/fetchURL";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";
import { CHAIN } from "../../helpers/chains";
import { fetchURLWithRetry } from "../../helpers/duneRequest";

const chains = [CHAIN.AVAX, CHAIN.ARBITRUM];

const chainMap: Record<string, string> = {
  [CHAIN.AVAX]: "avalanche_c",
};
const NAME = "yield_yak";

const fetch = (chain: string) => async (timestamp: number) => {
  const unixTimestamp = getUniqStartOfTodayTimestamp(
    new Date(timestamp * 1000)
  );

  const data = (await fetchURLWithRetry("https://api.dune.com/api/v1/query/3321376/results")).result?.rows;
  const dayData = data.find(
    ({ block_date, blockchain, project, }: { block_date: number; blockchain: string; project: string; }) =>
      getUniqStartOfTodayTimestamp(new Date(block_date)) === unixTimestamp &&
      blockchain === (chainMap[chain] || chain) &&
      project === NAME
  );

  return {
    dailyVolume: dayData?.trade_amount ?? "0",
    timestamp: unixTimestamp,
  };
};

const adapter: any = {
  adapter: {
    ...chains.reduce((acc, chain) => {
      return {
        ...acc,
        [chain]: {
          fetch: fetch(chain),
          runAtCurrTime: true,
          start: 1685491200,
        },
      };
    }, {}),
  },
};

export default adapter;
