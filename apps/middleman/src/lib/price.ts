import { unstable_cache } from "next/cache";
import { cache } from "react";

export interface Price {
  usd: number;
  usd_market_cap: number;
  usd_24h_change: number;
}

const API_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=pocket-network&vs_currencies=usd&include_24hr_change=true&include_market_cap=true";

// We are using unstable_cache here because we want to cache the response for 60 seconds
// and React.cache to only make one request per page render
const getPrice = cache(
  unstable_cache(
    async (): Promise<Price> => {
      const data = await fetch(API_URL, {
        next: { revalidate: 60 },
      }).then((res) => res.json());

      return data["pocket-network"];
    },
    ["price"],
    {
      revalidate: 60,
    }
  )
);

export default getPrice;
