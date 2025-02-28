"use client";

import { roundAndSeparate } from "@igniter/ui/lib/utils";
import { useTheme } from "next-themes";
import ChangeIndicator from "./ChangeIndicator";

interface PriceProps {
  value: number;
  change: number;
  showLabel?: boolean;
  priceColor?: string;
  fontSize?: string;
}

export default function Price({
  value,
  change,
  showLabel = true,
  priceColor = "--primary",
  fontSize = "sm",
}: PriceProps) {
  const theme = useTheme();

  const color = `text-(${priceColor})`;
  const text = `text-${fontSize}`;

  return (
    <p className={`${text} font-mono flex flex-row items-center gap-3`}>
      {showLabel && (
        <span className="text-(--slightly-muted-foreground)">$POKT</span>
      )}
      <span className={`${color}`}>
        {" "}
        $ {value ? roundAndSeparate(value, 5) : "-"}{" "}
      </span>
      <ChangeIndicator change={change} />
    </p>
  );
}
