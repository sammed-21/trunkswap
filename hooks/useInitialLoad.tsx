// components/InitialLoad.tsx
"use client";

import { usePriceFeed } from "@/hooks/usePriceFeed";
import { FACTORY_ADDRESS } from "@/lib/constants";
import { getProvider } from "@/services/getProvider";
import { useAccountState } from "@/state/accountStore";
import { useLiquidityActions } from "@/state/liquidityStore";
import { usePoolActions } from "@/state/poolStore";
import { usePriceState } from "@/state/priceStore";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
// import { WalletInit } from "@/services/WalletInit"; // changed from useWalletInit

export const useInitialLoad = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { fetchPools } = useLiquidityActions();

  const { updateTokenBalances, fetchAllTokens } = useSwapActions();

  const { fetchPriceFlag, prices } = usePriceState();
  const { provider } = useAccountState();

  useEffect(() => {
    if (!provider || !chainId) return;
    fetchPools(provider);
  }, [provider, chainId, fetchPriceFlag]);

  useEffect(() => {
    if (isConnected && provider && address) {
      // (provider, address, FACTORY_ADDRESS(chainId));
      fetchAllTokens(address, provider);
      updateTokenBalances(address, provider);
    }
  }, [isConnected, provider, address]);

  return null;
};
