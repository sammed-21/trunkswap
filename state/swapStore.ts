"use client";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { SwapActions, SwapState, TokenDetail } from "@/lib/types";
import {
  DEFAULT_BUY_TOKEN,
  DEFAULT_SELL_TOKEN,
  defaultChainId,
  MAINNET_TOKENS,
  MAINNET_TOKENS_BY_SYMBOL,
} from "@/lib/constants";
import { fetchTokenBalance } from "@/services/getTokenBalance";

// Unified Zustand Store
const useSwapStore = create<SwapState & SwapActions>((set, get) => ({
  tokens: MAINNET_TOKENS,
  // Initial State
  TokenB: "DAI",
  TokenA: "WETH",
  TokenBAmount: "",
  tradeDirection: "sell",
  TokenAAmount: "",
  slippage: 0.5,
  currentSellAsset:
    MAINNET_TOKENS_BY_SYMBOL[DEFAULT_SELL_TOKEN(defaultChainId)?.toLowerCase()],
  currentBuyAsset:
    MAINNET_TOKENS_BY_SYMBOL[DEFAULT_BUY_TOKEN(defaultChainId)?.toLowerCase()],
  selectorOpen: false,
  isWalletConnected: false,
  tokenABalance: "0",
  tokenBBalance: "0",
  loadingBalances: false,
  deadline: 20,
  transactionButtonText: "Swap",
  isSwapping: false,
  quoteLoading: false,
  needsApproval: false,
  isApproving: false,
  minAmountOut: {
    raw: null,
    formatted: null,
  },
  quoteAmount: null,
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
  setDeadline: (deadline) => set({ deadline: deadline }),
  setCurrentSellAsset: (asset: TokenDetail) =>
    set(() => ({
      currentSellAsset: asset,
    })),
  setCurrentBuyAsset: (asset: TokenDetail) =>
    set(() => ({
      currentBuyAsset: asset,
    })),
  setWalletConnected: (isConnected: boolean) =>
    set(() => ({
      isWalletConnected: isConnected,
    })),
  setTokenABalance: (balance: string) =>
    set(() => ({
      tokenABalance: balance,
    })),
  setTokenBBalance: (balance: string) =>
    set(() => ({
      tokenBBalance: balance,
    })),
  setLoadingBalances: (loading: boolean) =>
    set(() => ({
      loadingBalances: loading,
    })),
  setTransactionButtonText: (transactionButtonText: string) =>
    set({ transactionButtonText }),
  setIsSwapping: (isSwapping: boolean) => set({ isSwapping }),

  setQuoteLoading: (quoteLoading: boolean) => set({ quoteLoading }),
  setQuotedAmount: (quoteAmount: any) => set({ quoteAmount }),

  setNeedsApproval: (needsApproval: boolean) => set({ needsApproval }),
  setIsApproving: (isApproving: boolean) => set({ isApproving }),
  setMinAmountOut: (minAmountOut: any) => set({ minAmountOut }),
  // Function to fetch token balances when wallet connects
  fetchTokenBalances: async (walletAddress: string, provider: any) => {
    const { currentSellAsset, currentBuyAsset } = get();

    if (!walletAddress || !provider) return;

    try {
      set({ loadingBalances: true });

      // Fetch Token A balance
      const tokenABalance = await fetchTokenBalance(
        currentSellAsset?.address,
        walletAddress,
        provider,
        currentSellAsset?.decimals
      );

      // Fetch Token B balance
      const tokenBBalance = await fetchTokenBalance(
        currentBuyAsset?.address,
        walletAddress,
        provider,
        currentBuyAsset?.decimals
      );

      set({
        tokenABalance,
        tokenBBalance,
        loadingBalances: false,
      });
    } catch (error) {
      console.error("Error fetching token balances:", error);
      set({
        loadingBalances: false,
        tokenABalance: "0",
        tokenBBalance: "0",
      });
    } finally {
      set({
        loadingBalances: false,
      });
    }
  },

  // Function to update balances when tokens change
  updateTokenBalances: async () => {
    const { isWalletConnected, fetchTokenBalances } = get();

    // Only fetch balances if wallet is connected
    if (isWalletConnected) {
      // Get current wallet address and provider from your wallet connection logic
      const walletAddress = window.ethereum?.selectedAddress;
      const provider = window.ethereum;

      if (walletAddress && provider) {
        await fetchTokenBalances(walletAddress, provider);
      }
    }
  },
}));

// Helper function to fetch token balance

// Selector for State Only
export const useSwapState = () =>
  useSwapStore(
    useShallow((state: SwapState) => ({
      TokenB: state.TokenB,
      TokenA: state.TokenA,
      tokens: state.tokens,
      TokenBAmount: state.TokenBAmount,
      tradeDirection: state.tradeDirection,
      TokenAAmount: state.TokenAAmount,
      slippage: state.slippage,
      selectorOpen: state.selectorOpen,
      currentSellAsset: state.currentSellAsset,
      currentBuyAsset: state.currentBuyAsset,
      isWalletConnected: state.isWalletConnected,
      tokenABalance: state.tokenABalance,
      tokenBBalance: state.tokenBBalance,
      loadingBalances: state.loadingBalances,
      deadline: state.deadline,
      transactionButtonText: state.transactionButtonText,
      isSwapping: state.isSwapping,
      quoteLoading: state.quoteLoading,
      needsApproval: state.needsApproval,
      isApproving: state.isApproving,
      minAmountOut: state.minAmountOut,
      quoteAmount: state.quoteAmount,
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
      setTradeDirection: state.setTradeDirection,
      setSlippage: state.setSlippage,
      setSelectorOpen: state.setSelectorOpen,
      setCurrentSellAsset: state.setCurrentSellAsset,
      setCurrentBuyAsset: state.setCurrentBuyAsset,
      setWalletConnected: state.setWalletConnected,
      fetchTokenBalances: state.fetchTokenBalances,
      updateTokenBalances: state.updateTokenBalances,
      setDeadline: state.setDeadline,
      setTransactionButtonText: state.setTransactionButtonText,
      setTokenABalance: state.setTokenABalance,
      setTokenBBalance: state.setTokenBBalance,
      setIsSwapping: state.setIsSwapping,
      setQuoteLoading: state.setQuoteLoading,
      setNeedsApproval: state.setNeedsApproval,
      setIsApproving: state.setIsApproving,
      setMinAmountOut: state.setMinAmountOut,
      setQuotedAmount: state.setQuotedAmount,
    }))
  );
