"use client";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import {
  Prices,
  SwapActions,
  SwapState,
  Token,
  TokenDetail,
} from "@/lib/types";
import {
  DEFAULT_BUY_TOKEN,
  DEFAULT_SELL_TOKEN,
  defaultChainId,
  isWETHAddress,
  MAINNET_TOKENS,
  TOKENS_BY_CHAIN_AND_SYMBOL,
} from "@/lib/constants";
import { fetchTokenBalance } from "@/services/getTokenBalance";
import { fetchETHBalance, formatDigits } from "@/lib/utils";
// import {
//   getTokenUSDPrice,
//   getUSDValue,
//   getUSDValueSync,
//   updatePrices,
// } from "@/services/priceFeed";
import { usePriceState, usePriceStore } from "./priceStore";
import { useAccountStore } from "./accountStore";
import { formatUnits, Provider } from "ethers";
import { addressess } from "@/address";
import { getChainContractAddress } from "viem";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
// Unified Zustand Store

export const useSwapStore = create<SwapState & SwapActions>((set, get) => ({
  tokens: MAINNET_TOKENS,
  // Initial State
  token1: DEFAULT_BUY_TOKEN(defaultChainId)?.toUpperCase(),
  token0: DEFAULT_SELL_TOKEN(defaultChainId)?.toUpperCase(),
  chartActiveToken: DEFAULT_SELL_TOKEN(defaultChainId)?.toUpperCase(),
  tokensWithBalances: [],
  TokenBAmount: "",
  tradeDirection: "sell",
  TokenAAmount: "",
  slippage: 0.5,

  currentSellAsset:
    TOKENS_BY_CHAIN_AND_SYMBOL[defaultChainId]?.[
      DEFAULT_SELL_TOKEN(defaultChainId)?.toLowerCase()
    ],
  currentBuyAsset:
    TOKENS_BY_CHAIN_AND_SYMBOL[defaultChainId]?.[
      DEFAULT_BUY_TOKEN(defaultChainId)?.toLowerCase()
    ],

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
  estimatedFees: {
    estimatedFee: null,
    formatedEstimatedFee: null,
  },
  exceedsBalanceError: false,
  priceImpact: null,
  fee: null,
  TokenAUsdValue: null,
  TokenBUsdValue: null,
  TokenAUsdPrice: null,
  TokenBUsdPrice: null,
  prices: {},
  chartFlag: true,

  // Actions
  setToken1: (token) =>
    set((state) => ({
      token1: token,
      token0: state.token0 === token ? "" : state.token0,
      TokenBUsdPrice: null,
      TokenBUsdValue: null,
    })),
  setToken0: (token) =>
    set((state) => ({
      token0: token,
      token1: state.token1 === token ? "" : state.token1,
      TokenAUsdPrice: null,
      TokenAUsdValue: null,
    })),

  setPrices: (prices: Prices) => set({ prices }),

  setTokenBAmount: (amount) => {
    const state = get();
    const token = state.token1;
    const pricesStores = usePriceStore.getState();
    const usdValue = amount
      ? pricesStores.getUSDValueSync(amount, token)
      : null;
    set({
      TokenBAmount: amount,
      TokenBUsdValue: usdValue,
    });

    (async () => {
      if (amount) {
        try {
          const freshUsdValue = await pricesStores.getUSDValue(
            amount,
            token,
            true
          );

          if (freshUsdValue !== usdValue) {
            set({ TokenBUsdValue: freshUsdValue });
          }
        } catch (error) {
          console.error("Error updating token1 USD value:", error);
        }
      }
    })();

    // Also update quote if needed
    if (state.tradeDirection === "sell") {
      // Here you'd typically call your quote service
      // updateQuote(state.token1, state.token0, state.TokenBAmount);
    }
  },

  setTokenAAmount: (amount) => {
    // Immediate update with sync method
    const state = get();
    const token = state.token0;
    const pricesStores = usePriceStore.getState();
    const usdValue = amount
      ? pricesStores.getUSDValueSync(amount, token)
      : null;
    const balanceA = get().tokenABalance;

    if (Number(balanceA) < Number(amount)) {
      state.setExceedsBalanceError(true);
    } else {
      state.setExceedsBalanceError(false);
    }
    // Update state with current value
    set({
      TokenAAmount: amount,
      TokenAUsdValue: usdValue,
    });

    // Then do an async update to get the most accurate value
    (async () => {
      if (amount) {
        try {
          // Get updated USD value with fresh price data
          const freshUsdValue = await pricesStores.getUSDValue(
            amount,
            token,
            true
          );

          // Only update if the value is different
          if (freshUsdValue !== usdValue) {
            set({ TokenAUsdValue: freshUsdValue });
          }
        } catch (error) {
          console.error("Error updating token0 USD value:", error);
        }
      }
    })();

    // Also update quote if needed
    if (state.tradeDirection === "buy") {
      // Here you'd typically call your quote service
      // updateQuote(state.token0, state.token1, state.TokenAAmount);
    }
  },
  setChartFlag: (chartFlag: boolean) => set({ chartFlag }),
  setChartActiveToken: (chartActiveToken: string) => set({ chartActiveToken }),
  setTokenBUsdValue: (usdValue: number | null | undefined) =>
    set({
      TokenBUsdValue: usdValue,
    }),
  setTokenAUsdValue: (usdValue: number | null | undefined) =>
    set({
      TokenAUsdValue: usdValue,
    }),
  // setTokenAAmount: (amount) =>
  //   set(() => ({ TokenAAmount: formatDigits(amount) })),
  setTradeDirection: (direction) => () => {
    const balanceA = get().tokenABalance;
    let amount = get().TokenAAmount;

    if (Number(balanceA) < Number(amount)) {
      get().setExceedsBalanceError(true);
    } else {
      get().setExceedsBalanceError(false);
    }

    set({ tradeDirection: direction });
  },
  setSlippage: (slippage) => set(() => ({ slippage })),
  setTokens: (tokens: any) => set({ tokens }),
  setSelectorOpen: (isOpen: Boolean) => set(() => ({ selectorOpen: isOpen })),
  setDeadline: (deadline) => set({ deadline: deadline }),
  setCurrentSellAsset: (asset: Token) => {
    const balanceA = get().tokenABalance;
    let amount = get().TokenAAmount;

    if (Number(balanceA) < Number(amount)) {
      get().setExceedsBalanceError(true);
    } else {
      get().setExceedsBalanceError(false);
    }

    set(() => ({
      currentSellAsset: asset,
    }));
  },
  setCurrentBuyAsset: (asset: Token) =>
    set(() => ({
      currentBuyAsset: asset,
    })),
  setIsWalletConnected: (isConnected: boolean) =>
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
  setQuoteAmount: (quoteAmount: any) => set({ quoteAmount }),
  setFee: (fee: string | null) => set({ fee }),
  setPriceImpact: (priceImpact: string | null) => set({ priceImpact }),

  setNeedsApproval: (needsApproval: boolean) => set({ needsApproval }),
  setIsApproving: (isApproving: boolean) => set({ isApproving }),
  setMinAmountOut: (minAmountOut: any) => set({ minAmountOut }),
  setEstimatedFees: (estimatedFee: any) => set({ estimatedFees: estimatedFee }),
  setExceedsBalanceError: (exceedsBalanceError: boolean) =>
    set({ exceedsBalanceError }),

  resetSwapState: () =>
    set({
      TokenBAmount: "",
      TokenAAmount: "",
      TokenAUsdValue: 0,
      TokenBUsdValue: 0,
      selectorOpen: false,
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
      estimatedFees: {
        estimatedFee: null,
        formatedEstimatedFee: null,
      },

      priceImpact: null,
      fee: null,
      // Don't reset tokens, balances, slippage, etc.
    }),
  // getAvailableTokens: (context: "swap" | "liquidity"): Token[] => {
  //   const chainId = useAccountStore.getState().chainId;
  //   const tokens = useSwapStore.getState().tokens;

  //   const wethToken = tokens.find(
  //     (t) =>
  //       t.address ===
  //       addressess[getNetworkNameUsingChainId(chainId)].WETH_ADDRESS
  //   );

  //   const ethToken: Token = {
  //     symbol: "ETH",
  //     name: "Ethereum",
  //     address: "0x0000000000000000000000000000000000000000", // or "native"
  //     chainId,
  //     decimals: 18,
  //     isNative: true,
  //   };

  //   if (context === "swap") {
  //     // If ETH token already included (unlikely), don't duplicate
  //     if (tokens.some((t) => t.isNative)) return tokens;
  //     return [...tokens, ethToken];
  //   }

  //   if (context === "liquidity") {
  //     const withoutWETH = tokens.filter(
  //       (t) => t.address !== wethToken?.address
  //     );
  //     return [...withoutWETH, ethToken];
  //   }

  //   return tokens;
  // },
  // fetchAllTokens: async (walletAddress: string, provider: Provider) => {
  //   const { tokens } = get();
  //   const chainId = useAccountStore.getState().chainId;
  //   if (!chainId || !walletAddress || !provider) return [];

  //   await updatePrices();

  //   // Fetch updated balances for all tokens
  //   const updatedTokens = await Promise.all(
  //     tokens.map(async (token) => {
  //       if (token.chainId !== chainId) return token;

  //       let balance;
  //       if (isWETHAddress(token.address, token.chainId)) {
  //         // For WETH token, fetch native ETH balance instead
  //         balance = await provider.getBalance(walletAddress);
  //       } else {
  //         balance = await fetchTokenBalance(
  //           token.address,
  //           walletAddress,
  //           provider,
  //           token.decimals,
  //           chainId
  //         );
  //       }

  //       // Format balance from BigNumber to string with decimals
  //       const formattedBalance = formatUnits(balance, token.decimals);

  //       const usdValue = await getUSDValue(formattedBalance, token.symbol);
  //       return { ...token, balance: formattedBalance, usdValue };
  //     })
  //   );

  //   // Fetch native ETH balance separately and create ETH token object
  //   const ethBalanceRaw = await provider.getBalance(walletAddress);
  //   const ethBalance = formatUnits(ethBalanceRaw, 18);

  //   const ethToken: Token = {
  //     symbol: "ETH",
  //     name: "Ethereum",
  //     address: "0x0000000000000000000000000000000000000000",
  //     chainId,
  //     decimals: 18,
  //     isNative: true,
  //     balance: ethBalance,
  //     usdValue: await getUSDValue(ethBalance, "ETH"),
  //   };

  //   // Combine ETH token with updated tokens, removing duplicates of ETH symbol
  //   const tokensWithETH = [
  //     ethToken,
  //     ...updatedTokens.filter((t) => t.symbol.toLowerCase() !== "eth"),
  //   ];

  //   set({ tokens: tokensWithETH });

  //   return tokensWithETH;
  // },

  // fetchTokenBalanceFor: async (
  //   token: Token,
  //   walletAddress: string,
  //   provider: Provider,
  //   chainId: number
  // ): Promise<Token> => {
  //   if (!token || !walletAddress || !provider || !chainId) return token;

  //   let balance;
  //   if (token.isNative || isWETHAddress(token.address, chainId)) {
  //     balance = await provider.getBalance(walletAddress);
  //   } else {
  //     balance = await fetchTokenBalance(
  //       token.address,
  //       walletAddress,
  //       provider,
  //       token.decimals,
  //       chainId
  //     );
  //   }

  //   const formattedBalance = formatUnits(balance.toString(), token.decimals);
  //   const usdValue = await getUSDValue(formattedBalance, token.symbol);

  //   return { ...token, balance: formattedBalance, usdValue };
  // },

  fetchAllTokens: async (walletAddress: string, provider: Provider) => {
    const { tokens } = get();
    const { updatePrices, getUSDValue } = usePriceStore.getState();
    const chainId = useAccountStore.getState().chainId;
    await updatePrices();
    const updatedTokens = await Promise.all(
      tokens.map(async (token) => {
        let balance;
        if (token.chainId !== chainId) return token;
        // if (isWETHAddress(token.address, token.chainId)) {
        //   balance = await fetchETHBalance(walletAddress, chainId);
        // } else {
        balance = await fetchTokenBalance(
          token.address,
          walletAddress,
          provider,
          token.decimals,
          chainId
        );
        // }

        const usdValue = await getUSDValue(balance!, token.symbol);
        return { ...token, balance, usdValue };
      })
    );

    set({ tokens: updatedTokens });
    return tokens;
  },
  fetchTokenBalanceFor: async (
    token: Token,
    walletAddress: string,
    provider: Provider,
    chainId: number
  ) => {
    const { getUSDValue } = usePriceStore.getState();
    const balance = await fetchTokenBalance(
      token.address,
      walletAddress,
      provider,
      token.decimals
      // chainId
    );
    const usdValue = await getUSDValue(balance, token.symbol);
    return { ...token, balance, usdValue };
  },

  getTokenBySymbol: (symbol: string) =>
    get().tokens.find(
      (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
    ),

  updateTokenBalances: async (walletAddress: string, provider: any) => {
    const { currentSellAsset, currentBuyAsset, fetchTokenBalanceFor } = get();
    const chainId = useAccountStore.getState().chainId;
    if (
      !walletAddress ||
      !provider ||
      !currentSellAsset ||
      !currentBuyAsset ||
      !chainId
    )
      return;
    try {
      set({ loadingBalances: true });

      const updatedTokenA = await fetchTokenBalanceFor(
        currentSellAsset,
        walletAddress,
        provider,
        chainId
      );
      const updatedTokenB = await fetchTokenBalanceFor(
        currentBuyAsset,
        walletAddress,
        provider,
        chainId
      );
      set({
        tokenABalance: updatedTokenA.balance,
        tokenBBalance: updatedTokenB.balance,
        loadingBalances: false,
      });

      // Optional: update the tokens list if needed
      const updatedTokens = get().tokens.map((token) => {
        if (token.address === updatedTokenA.address) return updatedTokenA;
        if (token.address === updatedTokenB.address) return updatedTokenB;
        return token;
      });

      set({ tokens: updatedTokens });
    } catch (error) {
      console.error("Error updating balances:", error);
      set({
        tokenABalance: "0",
        tokenBBalance: "0",
        loadingBalances: false,
      });
    }
  },
  updateUsdValues: async () => {
    const state = get();
    const { getUSDValue, updatePrices, getTokenUSDPrice } =
      usePriceStore.getState();

    // Force update the prices first
    await updatePrices();

    // Calculate and update token0 USD value if there's an amount
    if (state.token0 && state.TokenAAmount) {
      const tokenAUsdValue = await getUSDValue(
        state.TokenAAmount,
        state.token0
      );
      set({ TokenAUsdValue: tokenAUsdValue });
    }

    // Calculate and update token1 USD value if there's an amount
    if (state.token1 && state.TokenBAmount) {
      const tokenBUsdValue = await getUSDValue(
        state.TokenBAmount,
        state.token1
      );
      set({ TokenBUsdValue: tokenBUsdValue });
    }

    // Also update token prices
    const tokenAPrice = state.token0 ? getTokenUSDPrice(state.token0) : null;
    const tokenBPrice = state.token1 ? getTokenUSDPrice(state.token1) : null;

    set({
      TokenAUsdPrice: tokenAPrice,
      TokenBUsdPrice: tokenBPrice,
    });
  },

  setTokenAUsdPrice: (tokenPriceUsd: number) =>
    set({
      TokenAUsdPrice: tokenPriceUsd,
    }),
  setTokenBUsdPrice: (tokenPriceUsd: number) =>
    set({
      TokenBUsdPrice: tokenPriceUsd,
    }),
}));

// Helper function to fetch token balance

// Selector for State Only
export const useSwapState = () =>
  useSwapStore(
    useShallow((state: SwapState) => ({
      token1: state.token1,
      token0: state.token0,
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
      estimateFees: state.estimatedFees,
      fee: state.fee,
      priceImpact: state.priceImpact,
      TokenAUsdValue: state.TokenAUsdValue,
      TokenBUsdValue: state.TokenBUsdValue,
      TokenAUsdPrice: state.TokenAUsdPrice,
      TokenBUsdPrice: state.TokenBUsdPrice,
      prices: state.prices,
      exceedsBalanceError: state.exceedsBalanceError,
      chartFlag: state.chartFlag,
      chartActiveToken: state.chartActiveToken,
      tokensWithBalances: state.tokensWithBalances,
    }))
  );

// Selector for Actions Only
export const useSwapActions = () =>
  useSwapStore(
    useShallow((state: SwapActions) => ({
      setToken1: state.setToken1,
      setToken0: state.setToken0,
      setTokens: state.setTokens,
      setTokenBAmount: state.setTokenBAmount,
      setTokenAAmount: state.setTokenAAmount,
      setTradeDirection: state.setTradeDirection,
      setSlippage: state.setSlippage,
      setSelectorOpen: state.setSelectorOpen,
      setCurrentSellAsset: state.setCurrentSellAsset,
      setCurrentBuyAsset: state.setCurrentBuyAsset,
      setIsWalletConnected: state.setIsWalletConnected,
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
      setQuoteAmount: state.setQuoteAmount,
      setEstimatedFees: state.setEstimatedFees,
      setPriceImpact: state.setPriceImpact,
      setFee: state.setFee,
      updateUsdValues: state.updateUsdValues,
      resetSwapState: state.resetSwapState,
      setTokenBUsdValue: state.setTokenBUsdValue,
      setTokenAUsdValue: state.setTokenAUsdValue,
      setTokenAUsdPrice: state.setTokenAUsdPrice,
      setTokenBUsdPrice: state.setTokenBUsdPrice,
      setPrices: state.setPrices,
      setExceedsBalanceError: state.setExceedsBalanceError,
      setChartFlag: state.setChartFlag,
      setChartActiveToken: state.setChartActiveToken,
      fetchAllTokens: state.fetchAllTokens,
    }))
  );
