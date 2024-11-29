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
  buyToken: "DAI",
  sellToken: "WETH",
  buyAmount: "",
  tradeDirection: "sell",
  sellAmount: "",
  slippage: 0.5,
  currentSellAsset:
    MAINNET_TOKENS_BY_SYMBOL[DEFAULT_SELL_TOKEN(1)?.toLowerCase()],
  currentBuyAsset:
    MAINNET_TOKENS_BY_SYMBOL[DEFAULT_BUY_TOKEN(1)?.toLowerCase()],
  selectorOpen: false,

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
      buyToken: state.buyToken,
      sellToken: state.sellToken,
      tokens: state.tokens,
      buyAmount: state.buyAmount,
      tradeDirection: state.tradeDirection, // Include tradeDirection
      sellAmount: state.sellAmount,
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
      setBuyToken: state.setBuyToken,
      setSellToken: state.setSellToken,
      setTokens: state.setTokens,
      setBuyAmount: state.setBuyAmount,
      setSellAmount: state.setSellAmount,
      setTradeDirection: state.setTradeDirection, // Include setTradeDirection
      setSlippage: state.setSlippage,
      setSelectorOpen: state.setSelectorOpen,
      setCurrentSellAsset: state.setCurrentSellAsset, // Include setCurrentSellAsset action
      setCurrentBuyAsset: state.setCurrentBuyAsset, // Include setSelectorOpen action
    }))
  );
