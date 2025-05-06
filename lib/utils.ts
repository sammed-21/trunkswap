import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Prices } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDigits(value: any, decimalPlaces: number = 4): string {
  if (value === undefined || value === null) return "-";

  let number = Number(value);

  if (isNaN(number)) return "-";

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  });
}

export function deadlineFormatted(min: number = 20) {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000); // current time in seconds
  const deadline = currentTimeInSeconds + min * 60; // add 20 minutes (20 * 60 seconds)
  return deadline;
}

export function shortenAddress(address: string | `0x${string}`) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const getPrice = (
  token: string,
  prices: Prices | null
): number | null => {
  return prices?.[`${token === "WETH" ? "ETH" : token}_USD`] ?? null;
};
