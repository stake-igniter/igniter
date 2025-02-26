import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const roundAndSeparate = (
    value: number,
    decimalPlaces = 4,
    defaultValue: string | number = "-"
) => {
  return value
      ? parseFloat(value.toFixed(decimalPlaces)).toLocaleString(undefined, {
        maximumFractionDigits: decimalPlaces,
      })
      : (defaultValue as string);
};
