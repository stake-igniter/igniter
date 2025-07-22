import React from "react";
import getPrice from "../../lib/price";
import Price from "@igniter/ui/components/Price";

export default async function PriceWidget() {
  const price = await getPrice();

  return (
    <div className="rounded-md">
      <div className="flex flex-row gap-1 items-center">
        {price && (
          <Price
            value={price.usd}
            change={price.usd_24h_change}
            showLabel
          />
        )}
      </div>
    </div>
  );
}
