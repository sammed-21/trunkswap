// components/InitialLoad.tsx
"use client";

import { usePriceFeed } from "@/hooks/usePriceFeed";
import { FACTORY_ADDRESS } from "@/lib/constants";
import { getProvider } from "@/services/walletEvents";
import { useAccountState } from "@/state/accountStore";
import { usePoolActions } from "@/state/poolStore";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
// import { WalletInit } from "@/services/WalletInit"; // changed from useWalletInit

const InitialLoad = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { fetchUserPositions, fetchPoolData } = usePoolActions();
  const {
    currentSellAsset,
    currentBuyAsset,
    prices,
    tokenABalance,
    tokenBBalance,
  } = useSwapState();
  const { fetchTokenBalances, updateTokenBalances } = useSwapActions();
  const { provider } = useAccountState();
  let providerDefault = !provider ? getProvider() : provider;

  useEffect(() => {
    const foolData = async () => {
      let position = await fetchPoolData(
        providerDefault,
        FACTORY_ADDRESS(chainId)
      );
    };
    foolData();
  }, [provider, chainId]);
  useEffect(() => {
    const foolData = async () => {
      if (address) {
        let position = await fetchUserPositions(
          providerDefault!,
          address,
          FACTORY_ADDRESS(chainId)
        );
      }
    };

    foolData();
  }, [address, chainId]);
  useEffect(() => {
    if (isConnected) {
      updateTokenBalances(String(address), provider);
    }
  }, [isConnected]);

  return <div className="w-full h-full relative">{children}</div>;
};

export default InitialLoad;
