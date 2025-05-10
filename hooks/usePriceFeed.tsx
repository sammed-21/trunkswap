import { useAccountState } from "@/state/accountStore";
import { useEffect, useState, useCallback } from "react";

// import {
//   initializePriceFeed,
//   updatePrices,
//   getUSDValue,
//   formatUSD,
//   getTokenUSDPrice,
//   type Symbol,
//   getUSDValueSync,
// } from "@/services/priceFeed";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { Prices } from "@/lib/types";
import { usePriceActions } from "@/state/priceStore";

interface UsePriceFeedReturn {
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshPrices: () => Promise<void>;
}

export function usePriceFeed(): UsePriceFeedReturn {
  const { provider, chainId: chain } = useAccountState();
  const { initializePriceFeed, formatUSD, updatePrices, setPrices } =
    usePriceActions();

  // Initialize price feeds on component mount or when provider/chainId changes

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
    isLoading,
    lastUpdated,
    refreshPrices,
  };
}
