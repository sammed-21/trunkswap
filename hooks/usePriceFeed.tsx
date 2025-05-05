import { useAccountState } from "@/state/accountStore";
import { useEffect, useState, useCallback } from "react";

import {
  initializePriceFeed,
  updatePrices,
  getUSDValue,
  formatUSD,
  getTokenUSDPrice,
  type Symbol,
  getUSDValueSync,
} from "@/services/priceFeed";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { Prices } from "@/lib/types";
import { useSwapTransactions } from "./useSwapTransaction";

interface UsePriceFeedReturn {
  getUSDValue: (amount: number | string, symbol: Symbol) => Promise<number>;
  getUSDValueSync: (amount: number | string, symbol: Symbol) => number;
  formatUSD: (value: number) => string;
  getTokenUSDPrice: (symbol: Symbol | string) => number;
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshPrices: () => Promise<void>;
}

export function usePriceFeed(): UsePriceFeedReturn {
  const { provider, chainId: chain } = useAccountState();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { setPrices } = useSwapActions();
  const { TokenAAmount } = useSwapState();
  // Initialize price feeds when provider and chain are available
  useEffect(() => {
    if (provider && chain) {
      const initFeeds = async () => {
        setIsLoading(true);
        try {
          await initializePriceFeed(chain, provider);
          setLastUpdated(new Date());
        } catch (error) {
          console.error("Failed to initialize price feeds:", error);
        } finally {
          setIsLoading(false);
        }
      };

      initFeeds();
    }
  }, [provider, chain]);

  // Set up a periodic price update
  useEffect(() => {
    if (!provider || !chain) return;

    const updateInterval = 10000; // 1 min
    const intervalId = setInterval(async () => {
      try {
        const prices = await updatePrices();
        ({ prices });
        setPrices(prices as unknown as Prices);

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error updating prices:", error);
      }
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [provider, chain]);

  // Function to manually refresh prices
  const refreshPrices = useCallback(async () => {
    if (!provider || !chain) return;

    setIsLoading(true);
    try {
      await updatePrices();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing prices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [provider, chain]);

  return {
    getUSDValue,
    getUSDValueSync,
    formatUSD,
    getTokenUSDPrice,
    isLoading,
    lastUpdated,
    refreshPrices,
  };
}
