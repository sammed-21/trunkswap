import { create } from "zustand";
import { shallow, useShallow } from "zustand/shallow";
import { ethers, Contract } from "ethers";
import React from "react";
import { Prices } from "@/lib/types";

// Types
export type Symbol = "ETH" | "WETH" | "USDC" | "STX" | "RSTX";

export interface PriceFeedsByChain {
  [chainId: number]: {
    [symbol: string]: string; // Mapping from 'ETH_USD', 'USDC_USD' => address
  };
}

// State Interface
export interface PriceState {
  prices: Prices;
  lastUpdated: number;
  feeds: Record<string, Contract>;
  isLoading: boolean;
  chainId: number | null;
  provider: ethers.Provider | null;
  fetchPriceFlag: boolean;
}

// Actions Interface
export interface PriceActions {
  initializePriceFeed: (
    chainId: number,
    provider: ethers.Provider
  ) => Promise<void>;
  updatePrices: () => Promise<Prices>;
  getUSDValue: (
    amount: number | string,
    symbol: Symbol | string,
    forceUpdate?: boolean
  ) => Promise<number>;
  getUSDValueSync: (amount: number | string, symbol: Symbol | string) => number;
  formatUSD: (value: number) => string;
  getTokenUSDPrice: (symbol: Symbol | string) => number;
}

// Combined store type
export type PriceStore = PriceState & PriceActions;

// Constants
const DEFAULT_PRICES: Record<string, number> = {
  STX_USD: 1.0, // Assuming STX is a stablecoin at $1
  RSTX_USD: 1.0, // Assuming rSTX is also pegged at $1
};

const UPDATE_INTERVAL = 60000; // 1 minute in milliseconds

const PRICE_FEED_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Price feeds by chain
const CHAINLINK_FEEDS: PriceFeedsByChain = {
  421614: {
    ETH_USD: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
    USDC_USD: "0x0153002d20B96532C639313c2d54c3dA09109309",
  },
  // Add more chains as needed
  // 84532: {
  //   ETH_USD: "0xBaseFeedAddressForETHUSD",
  //   USDC_USD: "0xBaseFeedAddressForUSDCUSD"
  // }
};

// Create the store
export const usePriceStore = create<PriceState & PriceActions>((set, get) => ({
  // State
  prices: {
    ETH_USD: 0,
    USDC_USD: 0,
    STX_USD: DEFAULT_PRICES.STX_USD,
    RSTX_USD: DEFAULT_PRICES.RSTX_USD,
  },
  fetchPriceFlag: false,
  lastUpdated: 0,
  feeds: {},
  isLoading: true,
  chainId: null,
  provider: null,

  // Actions
  initializePriceFeed: async (chainId: number, provider: ethers.Provider) => {
    if (!provider) return;

    set({ isLoading: true, chainId, provider, fetchPriceFlag: true });

    try {
      if (!(chainId in CHAINLINK_FEEDS)) {
        console.warn(`No Chainlink feeds configured for chainId ${chainId}`);
        return;
      }

      const chainFeeds = CHAINLINK_FEEDS[chainId];

      // Initialize contract instances
      const feeds = Object.entries(chainFeeds).reduce((acc, [key, address]) => {
        try {
          acc[key] = new Contract(address, PRICE_FEED_ABI, provider);
        } catch (error) {
          console.error(`Failed to initialize price feed for ${key}:`, error);
        }
        return acc;
      }, {} as Record<string, Contract>);

      set({
        feeds,
        prices: {
          ...get().prices,
          STX_USD: DEFAULT_PRICES.STX_USD,
          RSTX_USD: DEFAULT_PRICES.RSTX_USD,
        },
        fetchPriceFlag: false,
      });

      // Initial price update
      await get().updatePrices();
    } catch (error) {
      console.error("Failed to initialize price feeds:", error);
    } finally {
      set({ isLoading: false, fetchPriceFlag: false });
    }
  },

  updatePrices: async () => {
    const { feeds, lastUpdated, prices, isLoading } = get();
    const now = Date.now();

    // Return cached prices if updated recently and not forcing update
    if (now - lastUpdated < UPDATE_INTERVAL && !isLoading) {
      return prices;
    }

    // If already loading, just return current prices
    if (isLoading) {
      return prices;
    }

    set({ isLoading: true });

    try {
      if (!feeds || Object.keys(feeds).length === 0) {
        return prices;
      }

      const pricePromises = Object.entries(feeds).map(
        async ([key, contract]) => {
          try {
            const [, answer, , updatedAt]: any =
              await contract.latestRoundData();
            const decimals: number = await contract.decimals();
            const price = parseFloat(ethers.formatUnits(answer, decimals));

            const updatedAtMs = Number(updatedAt) * 1000;
            if (now - updatedAtMs > 86400000) {
              console.warn(
                `${key} price data is stale (more than 24 hours old)!`
              );
            }

            return { key, price };
          } catch (error) {
            console.error(`Failed to fetch price for ${key}:`, error);
            return { key, price: prices[key as keyof Prices] || 0 };
          }
        }
      );

      const updatedPrices = await Promise.allSettled(pricePromises);
      const newPrices = { ...prices };

      updatedPrices.forEach((result) => {
        if (result.status === "fulfilled") {
          const { key, price } = result.value;
          newPrices[key as keyof Prices] = price;
        }
      });

      set({ prices: newPrices, lastUpdated: now });
      return newPrices;
    } catch (error) {
      console.error("Failed to update prices:", error);
      return prices;
    } finally {
      set({ isLoading: false });
    }
  },

  getUSDValue: async (
    amount: number | string,
    symbol: Symbol | string,
    forceUpdate = false
  ): Promise<number> => {
    if (!amount) return 0;

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 0;
    const { prices, updatePrices } = get();

    // Force update prices if requested or if we don't have prices yet
    if (forceUpdate || prices.ETH_USD === 0 || prices.USDC_USD === 0) {
      await updatePrices();
    }

    switch (symbol.toUpperCase() as Symbol) {
      case "ETH":
      case "WETH":
        return numAmount * prices.ETH_USD;
      case "USDC":
        return numAmount * prices.USDC_USD;
      case "STX":
        return numAmount * prices.STX_USD;
      case "RSTX":
        return numAmount * prices.RSTX_USD;
      default:
        console.warn(`No price data for symbol: ${symbol}`);
        return 0;
    }
  },

  getUSDValueSync: (
    amount: number | string,
    symbol: Symbol | string
  ): number => {
    if (!amount) return 0;

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 0;

    const { prices } = get();

    switch (symbol.toUpperCase() as Symbol) {
      case "ETH":
      case "WETH":
        return numAmount * prices.ETH_USD;
      case "USDC":
        return numAmount * prices.USDC_USD;
      case "STX":
        return numAmount * prices.STX_USD;
      case "RSTX":
        return numAmount * prices.RSTX_USD;
      default:
        console.warn(`No price data for symbol: ${symbol}`);
        return 0;
    }
  },

  formatUSD: (value: number): string => {
    if (isNaN(value)) return "$0.00";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  getTokenUSDPrice: (symbol: Symbol | string): number => {
    const { prices } = get();

    switch (symbol.toUpperCase()) {
      case "ETH":
      case "WETH":
        return prices.ETH_USD;
      case "USDC":
        return prices.USDC_USD;
      case "STX":
        return prices.STX_USD;
      case "RSTX":
        return prices.RSTX_USD;
      default:
        return 0;
    }
  },
}));

// Selector hooks with optimized re-renders
export const usePriceState = () =>
  usePriceStore(
    useShallow((state: PriceState) => ({
      prices: state.prices,
      lastUpdated: state.lastUpdated,
      isLoading: state.isLoading,
      chainId: state.chainId,
      fetchPriceFlag: state.fetchPriceFlag,
    }))
  );

// Selector for Actions Only
export const usePriceActions = () =>
  usePriceStore(
    useShallow((state: PriceActions) => ({
      initializePriceFeed: state.initializePriceFeed,
      updatePrices: state.updatePrices,
      getUSDValue: state.getUSDValue,
      getUSDValueSync: state.getUSDValueSync,
      formatUSD: state.formatUSD,
      getTokenUSDPrice: state.getTokenUSDPrice,
    }))
  );

// Custom hook for a specific token's price with auto-update
export const useTokenPrice = (symbol: Symbol) => {
  const { prices, lastUpdated, isLoading } = usePriceState();
  const { updatePrices } = usePriceActions();

  // Auto-update price if stale
  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated > UPDATE_INTERVAL && !isLoading) {
      updatePrices();
    }
  }, [lastUpdated, isLoading, updatePrices]);

  return {
    price: prices[`${symbol}_USD` as keyof Prices] || 0,
    isLoading,
    lastUpdated,
  };
};

// Utility hook to format token amounts to USD
export const useFormattedUSDValue = (
  amount: number | string,
  symbol: Symbol
) => {
  const { getUSDValueSync, formatUSD } = usePriceActions();
  const { price } = useTokenPrice(symbol);

  // Only re-render when the token price or amount changes
  const usdValue = React.useMemo(() => {
    return getUSDValueSync(amount, symbol);
  }, [amount, symbol, price]);

  return formatUSD(usdValue);
};
