"use client";

import { Price as PriceType } from "@/lib/price";
import { roundAndSeparate } from "@/lib/utils";
import { useTheme } from "next-themes";

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

  const changeValue = `(${usd_24h_change < 0 ? "-" : ""}${roundAndSeparate(Math.abs(usd_24h_change), 2)})%`;

  let changeColor: string;

  if (usd_24h_change > 0) {
    changeColor = "text-(--success)";
  } else if (usd_24h_change < 0) {
    changeColor = "text-(--destructive-foreground)";
  } else {
    changeColor = "text-neutral-400";
  }

  const color = `text-(${priceColor})`;
  const text = `text-${fontSize}`;

  return (
    <p className={`${text} font-mono`}>
      {showLabel && (
        <span className="text-(--slightly-muted-foreground)">$POKT</span>
      )}
      <span className={`${color}`}>
        {" "}
        $ {usd ? roundAndSeparate(usd, 5) : "-"}{" "}
      </span>
      <span className={changeColor}>{changeValue}</span>
    </p>
  );
}
