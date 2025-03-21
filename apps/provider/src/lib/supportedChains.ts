import { unstable_cache } from "next/cache";
import { cache } from "react";

export interface ChainMap {
  [chain: string]: {
    label: string;
    image: string;
    mainColor: string;
  };
}

const API_URL = process.env.CHAINS_CDN_URL!;

const getChainsMap = cache(
  unstable_cache(
    async (): Promise<ChainMap> => {
      const data = await fetch(API_URL, {
        next: { revalidate: 60 },
      }).then((res) => res.json());

      return data;
    },
    ["chains_map"],
    {
      revalidate: 60,
    }
  )
);

export default getChainsMap;
