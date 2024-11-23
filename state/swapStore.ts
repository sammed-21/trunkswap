"use client";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";

interface SwapState {
  buyToken: string;
  sellToken: string;
  buyAmount: string;
  tradeDirection: "sell" | "buy";
  sellAmount: string;
  slippage: number;
}

interface SwapActions {
  setBuyToken: (token: string) => void;
  setSellToken: (token: string) => void;
  setBuyAmount: (amount: string) => void;
  setTradeDirection: (direction: "sell" | "buy") => void;
  setSellAmount: (amount: string) => void;
  setSlippage: (slippage: number) => void;
}

// Unified Zustand Store
const useSwapStore = create<SwapState & SwapActions>((set) => ({
  // Initial State
  buyToken: "DAI",
  sellToken: "WETH",
  buyAmount: "",
  tradeDirection: "sell", // Default direction
  sellAmount: "",
  slippage: 0.5,

  // Actions
  setBuyToken: (token) =>
    set((state) => ({
      buyToken: token,
      sellToken: state.sellToken === token ? "" : state.sellToken,
    })),
  setSellToken: (token) =>
    set((state) => ({
      sellToken: token,
      buyToken: state.buyToken === token ? "" : state.buyToken,
    })),

  setBuyAmount: (amount) => set(() => ({ buyAmount: amount })),
  setSellAmount: (amount) => set(() => ({ sellAmount: amount })),
  setTradeDirection: (direction) => set(() => ({ tradeDirection: direction })),
  setSlippage: (slippage) => set(() => ({ slippage })),
}));

// Selector for State Only
export const useSwapState = () =>
  useSwapStore(
    useShallow((state: SwapState) => ({
      buyToken: state.buyToken,
      sellToken: state.sellToken,
      buyAmount: state.buyAmount,
      tradeDirection: state.tradeDirection, // Include tradeDirection
      sellAmount: state.sellAmount,
      slippage: state.slippage,
    }))
  );

// Selector for Actions Only
export const useSwapActions = () =>
  useSwapStore(
    useShallow((state: SwapActions) => ({
      setBuyToken: state.setBuyToken,
      setSellToken: state.setSellToken,
      setBuyAmount: state.setBuyAmount,
      setSellAmount: state.setSellAmount,
      setTradeDirection: state.setTradeDirection, // Include setTradeDirection
      setSlippage: state.setSlippage,
    }))
  );
