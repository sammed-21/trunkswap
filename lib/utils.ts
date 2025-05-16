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

import React from "react";

type Props = {
  userLpBalance: string;
  totalSupply: string;
};

export const formatPercentage = (userLp: string, total: string): string => {
  const user = parseFloat(userLp);
  const supply = parseFloat(total);
  if (isNaN(user) || isNaN(supply) || supply === 0) return "0.00%";
  const percentage = (user / supply) * 100;
  return `${percentage.toFixed(2)}%`;
};

export const getBlockchainExplorer = (txHash: string, chainId: number) => {
  let Obj: Record<number, string> = {
    421614: "https://sepolia.arbiscan.io/tx/",
  };

  return `${Obj[chainId]}${txHash}`;
};

export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  if (isNaN(value)) return "$0.00";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
