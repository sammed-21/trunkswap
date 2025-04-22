"use client";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { SwapActions, SwapState, Token, TokenDetail } from "@/lib/types";
import {
  DEFAULT_BUY_TOKEN,
  DEFAULT_SELL_TOKEN,
  MAINNET_TOKENS,
  MAINNET_TOKENS_BY_SYMBOL,
} from "@/lib/constants";

// Unified Zustand Store
const useSwapStore = create<SwapState & SwapActions>((set) => ({
  tokens: MAINNET_TOKENS,
  // Initial State
  TokenB: "DAI",
  TokenA: "WETH",
  TokenBAmount: "",
  tradeDirection: "sell",
  TokenAAmount: "",
  slippage: 0.5,
  currentSellAsset:
    MAINNET_TOKENS_BY_SYMBOL[DEFAULT_SELL_TOKEN(1)?.toLowerCase()],
  currentBuyAsset:
    MAINNET_TOKENS_BY_SYMBOL[DEFAULT_BUY_TOKEN(1)?.toLowerCase()],
  selectorOpen: false,

  // Actions
  setTokenB: (token) =>
    set((state) => ({
      TokenB: token,
      TokenA: state.TokenA === token ? "" : state.TokenA,
    })),
  setTokenA: (token) =>
    set((state) => ({
      TokenA: token,
      TokenB: state.TokenB === token ? "" : state.TokenB,
    })),
  setTokenBAmount: (amount) => set(() => ({ TokenBAmount: amount })),
  setTokenAAmount: (amount) => set(() => ({ TokenAAmount: amount })),
  setTradeDirection: (direction) => set(() => ({ tradeDirection: direction })),
  setSlippage: (slippage) => set(() => ({ slippage })),
  setTokens: (tokens: any) => set({ tokens }),
  setSelectorOpen: (isOpen: Boolean) => set(() => ({ selectorOpen: isOpen })),
  setCurrentSellAsset: (asset: TokenDetail) =>
    set(() => ({
      currentSellAsset: asset,
    })),
  setCurrentBuyAsset: (asset: TokenDetail) =>
    set(() => ({
      currentBuyAsset: asset,
    })),
}));

// Selector for State Only
export const useSwapState = () =>
  useSwapStore(
    useShallow((state: SwapState) => ({
      TokenB: state.TokenB,
      TokenA: state.TokenA,
      tokens: state.tokens,
      TokenBAmount: state.TokenBAmount,
      tradeDirection: state.tradeDirection, // Include tradeDirection
      TokenAAmount: state.TokenAAmount,
      slippage: state.slippage,
      selectorOpen: state.selectorOpen,
      currentSellAsset: state.currentSellAsset, // Include currentSellAsset
      currentBuyAsset: state.currentBuyAsset, // Include selectorOpen state
    }))
  );

// Selector for Actions Only
export const useSwapActions = () =>
  useSwapStore(
    useShallow((state: SwapActions) => ({
      setTokenB: state.setTokenB,
      setTokenA: state.setTokenA,
      setTokens: state.setTokens,
      setTokenBAmount: state.setTokenBAmount,
      setTokenAAmount: state.setTokenAAmount,
      setTradeDirection: state.setTradeDirection, // Include setTradeDirection
      setSlippage: state.setSlippage,
      setSelectorOpen: state.setSelectorOpen,
      setCurrentSellAsset: state.setCurrentSellAsset, // Include setCurrentSellAsset action
      setCurrentBuyAsset: state.setCurrentBuyAsset, // Include setSelectorOpen action
    }))
  );
