import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useEffect, useState } from "react";

interface PriceDisplayProps {
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  className = "",
}) => {
  const {
    TokenA,
    TokenB,
    TokenAAmount,
    TokenBAmount,
    TokenAUsdValue,
    TokenBUsdValue,
  } = useSwapState();
  const { updateUsdValues } = useSwapActions();

  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  const {
    getUSDValue,
    getUSDValueSync,
    formatUSD,
    getTokenUSDPrice,
    isLoading,
    refreshPrices,
  } = usePriceFeed();

  // Update USD values on component mount and when tokens change
  useEffect(() => {
    const updateValues = async () => {
      updateUsdValues();
    };

    updateValues();

    // Set up periodic updates (every 30 seconds)
    const timer = setInterval(updateValues, 30000);
    setUpdateTimer(timer);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [TokenA, TokenB, updateUsdValues]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await refreshPrices();
    updateUsdValues();
  };

  // Calculate token prices
  const tokenAPrice = TokenA ? getTokenUSDPrice(TokenA) : null;
  const tokenBPrice = TokenB ? getTokenUSDPrice(TokenB) : null;

  return (
    <div className={`price-display ${className}`}>
      {isLoading ? (
        <div className="text-sm text-gray-500 animate-pulse">
          Loading prices...
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Token A Price */}
          {TokenA && (
            <div className="flex justify-between text-sm">
              <span>1 {TokenA} =</span>
              <span>{formatUSD(tokenAPrice || 0)}</span>
            </div>
          )}

          {/* Token B Price */}
          {TokenB && (
            <div className="flex justify-between text-sm">
              <span>1 {TokenB} =</span>
              <span>{formatUSD(tokenBPrice || 0)}</span>
            </div>
          )}

          {/* Exchange Rate (if both tokens are selected) */}
          {TokenA && TokenB && tokenAPrice && tokenBPrice && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 {TokenA} =</span>
              <span>
                {(tokenAPrice / tokenBPrice).toFixed(6)} {TokenB}
              </span>
            </div>
          )}

          {/* Refresh button */}
        </div>
      )}
    </div>
  );
};
