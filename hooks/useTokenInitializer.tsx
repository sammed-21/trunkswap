import { MAINNET_TOKENS } from "@/lib/constants";
import { useAccountState } from "@/state/accountStore";
import { useSwapActions } from "@/state/swapStore";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";

export const useTokenInitializer: React.FC = () => {
  const { setTokens, fetchAllTokens } = useSwapActions();
  const { address } = useAccount();
  const { provider } = useAccountState();
  useEffect(() => {
    if (address && provider) {
      fetchAllTokens(address, provider);
    }
  }, [address, provider]);
  return null;
};
