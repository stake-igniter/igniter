"use client";

import { Price as PriceType } from "@/lib/price";
import { roundAndSeparate } from "@/lib/utils";
import { useTheme } from "next-themes";
import ChangeIndicator from "./ChangeIndicator";

interface PriceProps extends PriceType {
  showLabel?: boolean;
  priceColor?: string;
  fontSize?: string;
}

export default function Price({
  usd,
  usd_24h_change,
  showLabel = true,
  priceColor = "--primary",
  fontSize = "sm",
}: PriceProps) {
  const theme = useTheme();
  const isLightMode = theme.theme === "light";

  const color = `text-(${priceColor})`;
  const text = `text-${fontSize}`;

  return (
    <p className={`${text} font-mono flex flex-row items-center gap-3`}>
      {showLabel && (
        <span className="text-(--slightly-muted-foreground)">$POKT</span>
      )}
      <span className={`${color}`}>
        {" "}
        $ {usd ? roundAndSeparate(usd, 5) : "-"}{" "}
      </span>
      <ChangeIndicator change={usd_24h_change} />
    </p>
  );
}
