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

export const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export function getShortAddress(address: string, length = 8) {
    return address && address.length
        ? address.slice(0, length) + "..." + address.slice(-length)
        : "";
}

export function toCurrencyFormat(value: number, maxFractionDigits = 2) {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: maxFractionDigits
    }).format(value)
}
