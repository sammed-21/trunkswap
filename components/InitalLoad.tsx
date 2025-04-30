// components/InitialLoad.tsx
"use client";

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
  const { currentSellAsset, currentBuyAsset } = useSwapState();
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
  }, []);
  useEffect(() => {
    const foolData = async () => {
      if (address) {
        let position = await fetchUserPositions(
          providerDefault!,
          address,
          FACTORY_ADDRESS(chainId)
        );
        await fetchTokenBalances(address, provider);
      }
    };

    foolData();
  }, [address, chainId]);
  useEffect(() => {
    if (isConnected) {
      updateTokenBalances(String(address), provider);
    }
  }, [isConnected, currentSellAsset, currentBuyAsset]);

  return (
    <>
      <div className="">{children}</div>
    </>
  );
};

export default InitialLoad;
