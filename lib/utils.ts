import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ParseResult, Prices, Token } from "./types";

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
import { getProvider } from "@/services/getProvider";
import { ethers } from "ethers";
import { addressess } from "@/address";
import { getChainContractAddress } from "viem";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";

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

export const fetchETHBalance = async (address: string, chainId: number) => {
  if (!address || !chainId || typeof window === "undefined") return;
  const provider = getProvider(chainId);
  const balance = await provider.getBalance(address);
  const formatted = ethers.formatEther(balance);
  return formatted;
};

export const getTokenAddress = (token: Token, chainId: number) => {
  if (token.symbol === "ETH") {
    return addressess[getNetworkNameUsingChainId(chainId)].WETH_ADDRESS; // for your current chain
  }
  return token.address;
};

export function truncateDecimalsMath(
  value: string | number,
  decimals: number
): string {
  const num = Number(value);
  if (isNaN(num)) return "0";
  const factor = 10 ** decimals;
  const truncated = Math.floor(num * factor) / factor;
  return truncated.toFixed(decimals);
}
// Utility function to safely format token amounts
// export const formatTokenAmount = (amount: string, decimals: number): string => {
//   if (!amount) return "0";

//   // Convert to string and handle scientific notation
//   let amountStr: string = String(amount);

//   // Handle scientific notation (e.g., 1e-7)
//   if (amountStr.includes("e")) {
//     amountStr = Number(amountStr).toFixed(decimals);
//   }

//   // Split by decimal point
//   const [whole, decimal] = amountStr.split(".");

//   if (!decimal) {
//     return whole || "0";
//   }

//   // Truncate decimals to token's decimal places (don't round to avoid precision issues)
//   const truncatedDecimal = String(decimal).slice(0, decimals);

//   // Remove trailing zeros
//   const cleanDecimal = truncatedDecimal.replace(/0+$/, "");

//   return cleanDecimal ? `${whole}.${cleanDecimal}` : whole;
// };

export const formatTokenAmount = (amount: string, decimals: number): string => {
  if (!amount) return "0";

  // Convert to string and handle scientific notation
  let amountStr: string = String(amount);

  // Handle scientific notation (e.g., 1e-7)
  if (amountStr.includes("e")) {
    amountStr = Number(amountStr).toFixed(decimals);
  }

  // Split by decimal point
  const [whole, decimal] = amountStr.split(".");

  // If there's no decimal part, return the whole number
  if (!decimal) {
    return whole || "0";
  }

  // Ensure decimal is a string before calling slice
  const decimalStr = String(decimal);

  // Truncate decimals to token's decimal places (don't round to avoid precision issues)
  const truncatedDecimal = decimalStr.slice(0, decimals);

  // Remove trailing zeros
  const cleanDecimal = truncatedDecimal.replace(/0+$/, "");

  return cleanDecimal ? `${whole}.${cleanDecimal}` : whole;
};

// Safe BigInt operations utility
const SafeBigInt = {
  // Convert number to BigInt safely
  fromNumber: (value: number): bigint => {
    if (!Number.isInteger(value)) {
      throw new Error("Cannot convert non-integer to BigInt");
    }
    return BigInt(Math.floor(value));
  },

  // Convert string to BigInt safely
  fromString: (value: string): bigint => {
    try {
      // Remove any decimal points for BigInt conversion
      const cleanValue = value.split(".")[0];
      return BigInt(cleanValue);
    } catch (error) {
      throw new Error(`Cannot convert "${value}" to BigInt`);
    }
  },

  // Multiply BigInt by decimal factor safely
  multiplyByDecimalFactor: (value: bigint, factor: number): bigint => {
    if (factor < 0 || factor > 1) {
      throw new Error("Factor must be between 0 and 1");
    }
    // Convert factor to integer operations to avoid precision loss
    const factorAsInt = Math.floor(factor * 10000); // Use 10000 for 4 decimal precision
    return (value * BigInt(factorAsInt)) / BigInt(10000);
  },

  // Safe division with floor
  divideAndFloor: (numerator: bigint, denominator: bigint): bigint => {
    return numerator / denominator; // BigInt division is already floor division
  },
};

export const safeParseUnits = (
  amount: string,
  decimals: number
): ParseResult => {
  try {
    if (!amount || amount.trim() === "") {
      return { success: true, value: BigInt(0) };
    }

    // Clean the input but don't truncate decimals
    const cleanAmount = amount.trim();

    // Validate the input format
    if (!/^\d*\.?\d*$/.test(cleanAmount)) {
      return { success: false, error: "Invalid number format" };
    }

    // Check if it's just a decimal point
    if (cleanAmount === "." || cleanAmount === "") {
      return { success: true, value: BigInt(0) };
    }

    // Additional validation for negative or zero values
    const numericValue = parseFloat(cleanAmount);
    if (isNaN(numericValue)) {
      return { success: false, error: "Invalid number" };
    }

    if (numericValue < 0) {
      return { success: false, error: "Amount cannot be negative" };
    }

    // Check for too many decimal places
    const decimalPart = cleanAmount.split(".")[1];
    if (decimalPart && decimalPart.length > decimals) {
      return {
        success: false,
        error: `Too many decimal places. Maximum ${decimals} decimals allowed.`,
      };
    }

    // Use ethers.parseUnits directly without pre-formatting
    const parsedValue = ethers.parseUnits(cleanAmount, decimals);

    return { success: true, value: parsedValue };
  } catch (error) {
    console.error(
      `Error parsing amount ${amount} with ${decimals} decimals:`,
      error
    );
    return {
      success: false,
      error: `Invalid amount format: Please enter a valid number`,
    };
  }
};
// / Calculate slippage with proper BigInt handling
export const calculateMinimumAmount = (
  amount: bigint,
  slippagePercent: number
): bigint => {
  if (slippagePercent < 0 || slippagePercent > 100) {
    throw new Error("Slippage must be between 0 and 100");
  }

  const slippageFactor = (100 - slippagePercent) / 100;
  return SafeBigInt.multiplyByDecimalFactor(amount, slippageFactor);
};

export const validateTokenInput = (
  input: string,
  decimals: number
): { isValid: boolean; error?: string; suggestion?: string } => {
  if (!input || input.trim() === "") {
    return { isValid: true };
  }

  const cleanInput = input.trim();

  // Check basic format
  if (!/^\d*\.?\d*$/.test(cleanInput)) {
    return {
      isValid: false,
      error: "Only numbers and decimal point allowed",
    };
  }

  // Check decimal places
  const decimalPart = cleanInput.split(".")[1];
  if (decimalPart && decimalPart.length > decimals) {
    const truncatedInput = cleanInput.substring(
      0,
      cleanInput.indexOf(".") + decimals + 1
    );
    return {
      isValid: false,
      error: `Maximum ${decimals} decimal places allowed`,
      suggestion: `Did you mean: ${truncatedInput}?`,
    };
  }

  // Check if it's a valid number
  const numericValue = parseFloat(cleanInput);
  if (isNaN(numericValue)) {
    return { isValid: false, error: "Invalid number" };
  }

  if (numericValue < 0) {
    return { isValid: false, error: "Amount cannot be negative" };
  }

  return { isValid: true };
};
