import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { TOKENS_BY_CHAIN_AND_SYMBOL } from "@/lib/constants";
import { Prices } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAccountState } from "@/state/accountStore";
import Image from "next/image";
import React, { memo, useCallback, useMemo, useState } from "react";
import { GoArrowSwitch } from "react-icons/go";

// Types for better type safety
interface TokenInfo {
  symbol: string;
  imageSrc: string;
  price: number | null;
}

interface ConversionRate {
  rate: number | null;
  fromToken: TokenInfo;
  toToken: TokenInfo;
}

interface TokenConversionProps {
  prices: Prices;
  isLoading?: boolean;
  from: string;
  to: string;
  children?: React.ReactNode;
  className?: string;
  showSwapButton?: boolean;
  precision?: number;
  onSwap?: (from: string, to: string) => void;
}

// Custom hook for token price calculations (reusable)
const useTokenPrices = (prices: Prices) => {
  return useCallback(
    (token: string): number | null => {
      const normalizedToken = token === "WETH" ? "ETH" : token;
      return prices?.[`${normalizedToken}_USD`] ?? null;
    },
    [prices]
  );
};

// Custom hook for token info (reusable)
const useTokenInfo = (chainId: number) => {
  return useCallback(
    (symbol: string): TokenInfo => {
      const imageSrc = `/tokens/${symbol.toLowerCase()}.svg`;
      return {
        symbol,
        imageSrc,
        price: null, // Will be set by parent component
      };
    },
    [chainId]
  );
};

// Memoized Token Display Component
const TokenDisplay = memo<{
  token: TokenInfo;
  amount?: string | number;
  showAmount?: boolean;
}>(({ token, amount = "1", showAmount = true }) => (
  <div className="flex items-center gap-1">
    {showAmount && <span>{amount}</span>}
    <Image
      src={token.imageSrc}
      alt={token.symbol}
      className="h-5 w-5"
      width={20}
      height={20}
      loading="lazy"
    />
    <span className="font-medium">{token.symbol}</span>
  </div>
));

TokenDisplay.displayName = "TokenDisplay";

// Memoized Conversion Rate Display
const ConversionRateDisplay = memo<{
  conversionData: ConversionRate;
  precision: number;
  showSwapButton: boolean;
  onSwap: () => void;
}>(({ conversionData, precision, showSwapButton, onSwap }) => {
  const { rate, fromToken, toToken } = conversionData;

  if (rate === null) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="w-[120px] h-[24px] rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2  text-sm">
      {showSwapButton && (
        <Button
          variant={"transparent"}
          className="px-2 border-none rounded hover:bg-gray-100 transition-colors"
          onClick={onSwap}
          aria-label="Swap conversion direction"
        >
          <GoArrowSwitch size={16} />
        </Button>
      )}

      <TokenDisplay token={fromToken} amount="1" />
      <span className="text-gray-500">=</span>
      <TokenDisplay
        token={toToken}
        amount={rate.toFixed(precision)}
        showAmount={true}
      />
    </div>
  );
});

ConversionRateDisplay.displayName = "ConversionRateDisplay";

// Main optimized component
const TokenConversion: React.FC<TokenConversionProps> = memo(
  ({
    prices,
    from,
    to,
    isLoading = false,
    children,
    className = "",
    showSwapButton = true,
    precision = 6,
    onSwap,
  }) => {
    const [isReversed, setIsReversed] = useState(false);
    const { chainId } = useAccountState();

    const getPrice = useTokenPrices(prices);
    const getTokenInfo = useTokenInfo(chainId);

    // Memoized conversion calculation
    const conversionData = useMemo((): ConversionRate => {
      const displayFrom = isReversed ? to : from;
      const displayTo = isReversed ? from : to;

      const fromTokenInfo = getTokenInfo(displayFrom);
      const toTokenInfo = getTokenInfo(displayTo);

      const fromPrice = getPrice(displayFrom);
      const toPrice = getPrice(displayTo);

      // Set prices in token info
      fromTokenInfo.price = fromPrice;
      toTokenInfo.price = toPrice;

      const rate = fromPrice && toPrice ? fromPrice / toPrice : null;

      return {
        rate,
        fromToken: fromTokenInfo,
        toToken: toTokenInfo,
      };
    }, [from, to, isReversed, getPrice, getTokenInfo]);

    // Memoized swap handler
    const handleSwap = useCallback(() => {
      setIsReversed((prev) => !prev);
      onSwap?.(isReversed ? from : to, isReversed ? to : from);
    }, [isReversed, from, to, onSwap]);

    // Loading state
    if (isLoading) {
      return (
        <div className={`flex items-center gap-2 h-8 ${className}`}>
          {children}
          <Skeleton className="w-[200px] h-[32px] rounded-md" />
        </div>
      );
    }

    return (
      <div
        className={cn(`flex items-center gap-2 h-8 bg-forground `, className)}
      >
        {children}
        <ConversionRateDisplay
          conversionData={conversionData}
          precision={precision}
          showSwapButton={showSwapButton}
          onSwap={handleSwap}
        />
      </div>
    );
  }
);

TokenConversion.displayName = "TokenConversion";

export default TokenConversion;

// Additional utility hook for multiple token conversions (bonus reusability)
export const useMultipleTokenConversions = (
  tokens: string[],
  baseCurrency: string,
  prices: Prices
) => {
  const getPrice = useTokenPrices(prices);

  return useMemo(() => {
    return tokens.map((token) => ({
      token,
      rate: (() => {
        const tokenPrice = getPrice(token);
        const basePrice = getPrice(baseCurrency);
        return tokenPrice && basePrice ? tokenPrice / basePrice : null;
      })(),
    }));
  }, [tokens, baseCurrency, getPrice]);
};

// Example usage of the utility hook:
/*
const MultiTokenConverter = ({ tokens, baseCurrency, prices }) => {
  const conversions = useMultipleTokenConversions(tokens, baseCurrency, prices);
  
  return (
    <div>
      {conversions.map(({ token, rate }) => (
        <div key={token}>
          1 {baseCurrency} = {rate?.toFixed(6) || 'Loading...'} {token}
        </div>
      ))}
    </div>
  );
};
*/
