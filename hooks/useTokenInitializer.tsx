import { MAINNET_TOKENS } from "@/lib/constants";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useEffect } from "react";

export const useTokenInitializer: React.FC = () => {
  const { setTokens } = useSwapActions();

  useEffect(() => {
    return () => setTokens(MAINNET_TOKENS);
  }, [setTokens]);

  return null;
};
