import React from "react";
import getPrice from "@/lib/price";
import Price from "../Price";

export default async function PriceWidget() {
  const price = await getPrice();

  return (
    <div className="rounded-md">
      <div className="flex flex-row gap-1 items-center">
        <Price {...price} showLabel />
      </div>
    </div>
  );
}
