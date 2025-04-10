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

export function toCurrencyFormat(value: number, maxFractionDigits = 2, minimumFractionDigits = 0) {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: minimumFractionDigits,
        maximumFractionDigits: maxFractionDigits
    }).format(value)
}

export function toCompactFormat(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value);
}

export function toDateFormat(value: Date | null) {
    return value
        ? value.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).replace(",", "")
        : "N/A";
}


export function generateId(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
