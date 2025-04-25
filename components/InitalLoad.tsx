// components/InitialLoad.tsx
"use client";

import { FACTORY_ADDRESS } from "@/lib/constants";
import { getProvider, WalletInit } from "@/services/walletEvents";
import { useAccountActions, useAccountState } from "@/state/accountStore";
import { usePoolActions } from "@/state/poolStore";
import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
// import { WalletInit } from "@/services/WalletInit"; // changed from useWalletInit

const InitialLoad = ({ children }: { children: React.ReactNode }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { fetchUserPositions, fetchPoolData } = usePoolActions();
  const { provider } = useAccountState();
  let providerDefault = !provider ? getProvider() : provider;
  console.log(providerDefault);
  useEffect(() => {
    const foolData = async () => {
      console.log(providerDefault);
      console.log(address, isConnected, "this is isndiel teh wallet init ");
      let position = await fetchPoolData(
        providerDefault,
        FACTORY_ADDRESS(chainId)
      );
      console.log(position);
    };
    foolData();
  }, []);
  useEffect(() => {
    const foolData = async () => {
      if (address) {
        console.log(address, isConnected, "this is isndiel teh wallet init ");
        let position = await fetchUserPositions(
          providerDefault!,
          address,
          FACTORY_ADDRESS(chainId)
        );
        console.log(position);
      }
    };
    foolData();
  }, [address, chainId]);
  return (
    <>
      <div>{children}</div>
    </>
  );
};

export default InitialLoad;
