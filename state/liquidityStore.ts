/// start new zustand store

import { create } from "zustand";
import { ethers, formatEther, getBigInt } from "ethers";
import { persist } from "zustand/middleware";
import { formatUnits, parseUnits } from "ethers";

// Import ABIs
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { useAccountState, useAccountStore } from "./accountStore";
import { useShallow } from "zustand/shallow";
import { getTVLForPool } from "@/services/pool/getPoolDetailsFunction";
import { Token } from "@/lib/types";
import { useSwapState, useSwapStore } from "./swapStore";
import { fetchTokenBalance } from "@/services/getTokenBalance";
import { usePriceStore } from "./priceStore";
import {
  FACTORY_ADDRESS,
  isWETHAddress,
  ROUTER_ADDRESS,
} from "@/lib/constants";
import { truncateDecimalsMath } from "@/lib/utils";
import { getUSDValue } from "@/services/priceFeed";

// // Types
// export interface Token {
//   address: string;
//   symbol: string;
//   name: string;
//   decimals: number;
//   logoURI?: string;
// }

export interface Pool {
  pairAddress: string;
  token0: Token;
  token1: Token;
  reserves0: string;
  reserves1: string;
  totalSupply: string;
  userLpBalance?: string;
  token0Price: string;
  token1Price: string;
  tvl: number;
}

export interface LiquidityState {
  // State variables
  defaultLiquidityTag: string;
  pools: Pool[];
  selectedPool: Pool | null;
  selectedToken0: Token | null;
  selectedToken1: Token | null;
  selectedTokenABalance: string;
  selectedTokenBBalance: string;
  tokenAUsdValue: number | null;
  tokenBUsdValue: number | null;
  tokenAAmount: string;
  tokenBAmount: string;
  lpTokenAmount: string;
  percentToRemove: number;
  transactionButtonText: string;
  transactionTokenAButtonText: string;
  transactionRemoveLiquidityText: string;
  transactionTokenBButtonText: string;
  isLoading: boolean;
  expectedLPToken: string;
  error: string | null;
  totalPool: number;
  tokenALoading: boolean;
  tokenBLoading: boolean;
  totalTvl: number;
  deadline: number;
  slippage: number;

  needsApprovalTokenA: boolean;
  isApprovingTokenA: boolean;
  needsApprovalTokenB: boolean;
  isApprovingTokenB: boolean;
  needsApprovalLP: boolean;

  // Loading states
  isUserTokenbalance: boolean;
  isLoadingPools: boolean;
  isAddingLiquidity: boolean;
  isRemovingLiquidity: boolean;
  isLpApproving: boolean;
}
export interface LiquidityActions {
  // Actions
  setDefaultLiquidityTag: (defaultLiquidityTag: string) => void;
  setToken0: (token: Token | null) => void;
  setToken1: (token: Token | null) => void;
  setTokenAAmount: (amount: string) => void;
  setTokenBAmount: (amount: string) => void;
  setLpTokenAmount: (amount: string) => void;
  setTokenALoading: (loading: boolean) => void;
  setDeadline: (value: number) => void;
  setSlippage: (value: number) => void;
  setTokenBLoading: (loading: boolean) => void;
  setPercentToRemove: (percent: number) => void;
  setIsRemovingLiquidity: (isRemovingLiquidity: boolean) => void;
  setSelectedPool: (pool: Pool | null) => void;
  setTransactionButtonText: (transactionButtonText: string) => void;
  getUserBalances: (userAdddress: string) => Promise<any>;
  // setNeedsApproval: (needsApproval: boolean) => void;
  // setIsApproving: (isApproving: boolean) => void;
  setIsLpApproving: (isLpApproving: boolean) => void;
  setNeedsApprovalTokenA: (needsApprovalTokenA: boolean) => void;
  setTransactionRemoveLiquidityText: (
    transactionRemoveLiquidityText: string
  ) => void;
  setTransactionTokenAButtonText: (transactionTokenAButtonText: string) => void;
  setTransactionTokenBButtonText: (transactionTokenBButtonText: string) => void;
  setIsApprovingTokenA: (needsApprovalTokenA: boolean) => void;
  setNeedsApprovalTokenB: (needsApprovalTokenB: boolean) => void;
  setNeedsApprovalLP: (needsApprovalLP: boolean) => void;
  setIsApprovingTokenB: (needsApprovalTokenB: boolean) => void;
  setError: (error: string) => void;
  // Pool operations
  fetchPools: (provider: ethers.Provider) => Promise<void>;
  fetchPoolDetails: (
    provider: ethers.Provider,
    pairAddress: string,
    chainId: number
  ) => Promise<Pool | null>;
  calculateTokenAAmount: (
    provider: ethers.Provider,
    tokenBAmount: string
  ) => Promise<{ tokenAValue: any; tokenBAmount: any } | undefined>;

  calculateTokenBAmount: (
    provider: ethers.Provider,
    tokenAAmount: string
  ) => Promise<{ tokenAAmount: any; tokenBValue: any } | undefined>;

  // Liquidity operations
  // addLiquidity: (
  //   signer: ethers.Signer,
  //   deadlineTimestamp: number
  // ) => Promise<string | null>;
  // removeLiquidity: (signer: ethers.Signer) => Promise<string | null>;

  // Utility functions
  resetForm: () => void;
  setPairFromAddresses: (
    provider: ethers.Provider,
    tokenAAddress: string,
    tokenBAddress: string,
    chainId: number
  ) => Promise<void>;
  calculateExpectedLpTokens: (provider: ethers.Provider) => Promise<string>;
  setisAddingLiquidity: (isAddingLiquidity: boolean) => void;
}

// Constants

export const useLiquidityStore = create<LiquidityState & LiquidityActions>(
  (set, get) => ({
    // Initial state
    defaultLiquidityTag: "Add",
    pools: [],
    transactionButtonText: "Add Liquidity",
    transactionTokenAButtonText: "",
    deadline: 20,
    transactionTokenBButtonText: "",
    selectedPool: null,
    selectedToken0: null,
    selectedToken1: null,
    selectedTokenABalance: "",
    selectedTokenBBalance: "",
    slippage: 5,
    tokenAAmount: "",
    tokenALoading: false,
    tokenBLoading: false,
    tokenBAmount: "",
    lpTokenAmount: "",
    percentToRemove: 0,
    isLoading: false,
    error: null,
    isLpApproving: false,
    totalPool: 0,
    totalTvl: 0,
    expectedLPToken: "0",
    tokenAUsdValue: 0,
    tokenBUsdValue: 0,
    // needsApproval: false,
    transactionRemoveLiquidityText: "Remove Liquidity",
    // isApproving: false,
    needsApprovalTokenA: false,
    isApprovingTokenA: false,
    needsApprovalTokenB: false,

    isApprovingTokenB: false,
    needsApprovalLP: false,
    isLoadingPools: false,
    isUserTokenbalance: false,
    isAddingLiquidity: false,
    isRemovingLiquidity: false,

    // Token selection
    setToken0: (token) => {
      set({
        selectedToken0: token,
        tokenAAmount: "",
        tokenBAmount: "",
      });
    },

    setToken1: (token) => {
      set({
        selectedToken1: token,
        tokenAAmount: "",
        tokenBAmount: "",
      });
    },

    // Input handling
    // setNeedsApproval: (needsApproval: boolean) => set({ needsApproval }),
    // setIsApproving: (isApproving: boolean) => set({ isApproving }),
    setDefaultLiquidityTag: (defaultLiquidityTag: string) =>
      set({ defaultLiquidityTag }),
    setIsLpApproving: (isLpApproving: boolean) => set({ isLpApproving }),
    setDeadline: (value: number) => set({ deadline: value }),
    setIsRemovingLiquidity: (isRemovingLiquidity: boolean) =>
      set({ isRemovingLiquidity }),
    setTransactionRemoveLiquidityText: (
      transactionRemoveLiquidityText: string
    ) => set({ transactionRemoveLiquidityText }),
    setSlippage: (value: number) => set({ slippage: value }),
    setTransactionTokenAButtonText: (transactionTokenAButtonText: string) =>
      set({ transactionTokenAButtonText }),
    setTransactionTokenBButtonText: (transactionTokenBButtonText: string) =>
      set({ transactionTokenBButtonText }),
    setisAddingLiquidity: (isAddingLiquidity: boolean) =>
      set({ isAddingLiquidity }),
    setNeedsApprovalTokenA: (needsApprovalTokenA: boolean) =>
      set({ needsApprovalTokenA }),
    setIsApprovingTokenA: (needsApprovalTokenA: boolean) =>
      set({ needsApprovalTokenA }),
    setNeedsApprovalTokenB: (needsApprovalTokenB: boolean) =>
      set({ needsApprovalTokenB }),
    setNeedsApprovalLP: (needsApprovalLP: boolean) => set({ needsApprovalLP }),
    setIsApprovingTokenB: (needsApprovalTokenB: boolean) =>
      set({ needsApprovalTokenB }),
    setTokenAAmount: (amount: string) => set({ tokenAAmount: amount }),
    setTokenBAmount: (amount: string) => set({ tokenBAmount: amount }),
    setLpTokenAmount: (amount) => set({ lpTokenAmount: amount }),
    setPercentToRemove: (percent) => set({ percentToRemove: percent }),
    setSelectedPool: (pool) => set({ selectedPool: pool }),
    setTokenALoading: (loading: boolean) => set({ tokenALoading: loading }),
    setTokenBLoading: (loading: boolean) => set({ tokenBLoading: loading }),
    setError: (error: string) => set({ error }),
    // Form reset
    resetForm: () =>
      set({
        tokenAAmount: "",
        tokenBAmount: "",
        lpTokenAmount: "",
        percentToRemove: 0,
        error: null,

        isAddingLiquidity: false,
        selectedTokenABalance: "",
        selectedTokenBBalance: "",
        isApprovingTokenA: false,
        isApprovingTokenB: false,
        transactionTokenBButtonText: "",
        transactionTokenAButtonText: "",
        transactionRemoveLiquidityText: "Remove Liquidity",
        needsApprovalTokenA: false,
        needsApprovalTokenB: false,

        isLoading: false,

        expectedLPToken: "0",
      }),

    // Fetch all pools
    fetchPools: async (provider) => {
      const chainId = useAccountStore.getState().chainId;
      try {
        set({ isLoadingPools: true, error: null });
        if (!provider || !chainId) return;

        const factoryContract = new ethers.Contract(
          FACTORY_ADDRESS(chainId),
          FACTORY_ABI,
          provider
        );

        // Get all pairs created by the factory
        const pairCount = await factoryContract.allPairsLength();
        const poolsPromises = [];
        if (pairCount !== BigInt(0)) {
          for (let i = 0; i < Number(pairCount); i++) {
            poolsPromises.push(
              (async () => {
                try {
                  const pairAddress = await factoryContract.allPairs(i);
                  const poolDetails = await get().fetchPoolDetails(
                    provider,
                    pairAddress,
                    chainId
                  );
                  return poolDetails;
                } catch (err) {
                  console.error(`Error fetching pool at index ${i}:`, err);
                  return null;
                }
              })()
            );
          }

          const pools = (await Promise.all(poolsPromises)).filter(
            (pool): pool is Pool => pool !== null
          );

          const poolTotalTVl = pools?.reduce((acc: number, item: Pool) => {
            return acc + item.tvl;
          }, 0);
          set({
            totalPool: pairCount,
            totalTvl: poolTotalTVl,
            pools,
            isLoadingPools: false,
          });
        } else {
          set({
            totalPool: pairCount,
            totalTvl: 0,
            pools: [],
            isLoadingPools: false,
          });
        }
      } catch (error) {
        console.error("Error fetching pools:", error);
        set({
          error:
            "Failed to load pools. Please check your connection and try again.",
          isLoadingPools: false,
        });
      } finally {
        set({ isLoadingPools: false });
      }
    },

    // Fetch details for a specific pool
    fetchPoolDetails: async (provider, pairAddress, chainId) => {
      const userAddress = useAccountStore.getState().address;
      try {
        const pairContract = new ethers.Contract(
          pairAddress,
          PAIR_ABI,
          provider
        );

        // Get pair tokens
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();
        const token0Contract = new ethers.Contract(
          token0Address,
          ERC20_ABI,
          provider
        );
        const token1Contract = new ethers.Contract(
          token1Address,
          ERC20_ABI,
          provider
        );

        // Get token details
        const [
          token0Symbol,
          token0Name,
          token0Decimals,
          token1Symbol,
          token1Name,
          token1Decimals,
          reserves,
          totalSupply,
        ] = await Promise.all([
          token0Contract.symbol(),
          token0Contract.name(),
          token0Contract.decimals(),
          token1Contract.symbol(),
          token1Contract.name(),
          token1Contract.decimals(),

          pairContract.getReserves(),
          pairContract.totalSupply(),
        ]);

        const token0IsWeth = isWETHAddress(token0Address, chainId);
        const token1IsWeth = isWETHAddress(token1Address, chainId);

        // Get user's LP balance
        let userLpBalance;
        let formatedUserLpBalance;
        let formateddTotalSupply = formatEther(totalSupply);
        if (userAddress) {
          userLpBalance = await pairContract?.balanceOf(userAddress);
          formatedUserLpBalance = formatUnits(userLpBalance, 18);
        }

        // Create token objects
        const token0: Token = {
          address: token0Address,
          symbol: token0IsWeth ? "ETH" : token0Symbol,
          name: token0IsWeth ? "Ethereum" : token0Name,
          decimals: token0Decimals,
          chainId: chainId,
          isNative: token0IsWeth,
        };

        const token1: Token = {
          address: token1Address,
          symbol: token1IsWeth ? "ETH" : token1Symbol,
          name: token1IsWeth ? "Ethereum" : token1Name,
          decimals: token1Decimals,
          chainId,
          isNative: token1IsWeth,
        };
        let reserve0 = reserves[0];
        let reserve1 = reserves[1];
        reserve0 = formatUnits(reserve0, token0Decimals);
        reserve1 = formatUnits(reserve1, token1Decimals);
        let tvl = await getTVLForPool(
          reserve0,
          token0Symbol,
          reserve1,
          token1Symbol
        );

        // Calculate prices from reserves
        const token1Price =
          reserve1 > 0
            ? formatUnits(
                (reserves[0] * ethers.parseUnits("1", token1Decimals)) /
                  reserves[1],
                token0Decimals
              )
            : "0";
        const token0Price =
          reserve0 > 0
            ? formatUnits(
                (reserves[1] * ethers.parseUnits("1", token0Decimals)) /
                  reserves[0],
                token1Decimals
              )
            : "0";

        return {
          pairAddress,
          token0,
          token1,
          reserves0: reserve0,
          reserves1: reserve1,
          totalSupply: formateddTotalSupply,
          userLpBalance: formatedUserLpBalance,
          token0Price,
          token1Price,
          tvl,
          isEthPair: token0.isNative || token1.isNative,
        };
      } catch (error) {
        console.error("Error fetching pool details:", error);
        return null;
      }
    },

    getUserBalances: async (userAddress: string) => {
      try {
        const { selectedToken0, selectedToken1 } = get();

        let { provider, chainId } = useAccountStore.getState();
        if (!provider) return;
        if (!userAddress || !selectedToken0 || !selectedToken1) return;

        let tokens;
        tokens = useSwapStore.getState().tokens;

        set({ isUserTokenbalance: true });

        // ✅ Fetch from the other store if tokens are not loaded
        if (!tokens || tokens.length === 0) {
          const fetchAllTokens = useSwapStore.getState().fetchAllTokens;
          tokens = fetchAllTokens(userAddress, provider);

          // 🔁 Update local copy after external fetch
        }
        if (!tokens) return;

        let balanceA = tokens.find((t: Token) => {
          if (isWETHAddress(t?.address, chainId)) {
            return t.symbol.toLowerCase() === "ETH";
          } else {
            return (
              t.symbol.toLowerCase() === selectedToken0.symbol.toLowerCase()
            );
          }
        });
        let balanceB = tokens.find((t: Token) => {
          if (isWETHAddress(t?.address, chainId)) {
            return t.symbol.toLowerCase() === "ETH";
          } else {
            return (
              t.symbol.toLowerCase() === selectedToken1.symbol.toLowerCase()
            );
          }
        });

        // 🔄 Fetch balances if not available
        if (balanceA && balanceA?.balance === undefined) {
          const bal = await fetchTokenBalance(
            balanceA.address,
            userAddress,
            provider,
            balanceA.decimals,
            chainId
          );
          balanceA = { ...balanceA, balance: bal };
        }

        if (balanceB && balanceB?.balance === undefined) {
          const bal = await fetchTokenBalance(
            balanceB.address,
            userAddress,
            provider,
            balanceB.decimals,
            chainId
          );
          balanceB = { ...balanceB, balance: bal };
        }

        // 🧠 Update state with fetched balances
        set({
          selectedTokenABalance: balanceA?.balance ?? "0",
          selectedTokenBBalance: balanceB?.balance ?? "0",
        });
        return {
          selectedTokenABalance: balanceA?.balance,
          selectedTokenBBalance: balanceB?.balance,
        };
      } catch (err) {
        console.error("Error in getUserBalances:", err);
      } finally {
        set({ isUserTokenbalance: false });
      }
    },

    // Set pair from token addresses
    // setPairFromAddresses: async (
    //   provider,
    //   tokenAAddress,
    //   tokenBAddress,
    //   chainId
    // ) => {
    //   try {
    //     set({ isLoading: true, error: null });

    //     // Load token details
    //     const token0Contract = new ethers.Contract(
    //       tokenAAddress,
    //       ERC20_ABI,
    //       provider
    //     );
    //     const token1Contract = new ethers.Contract(
    //       tokenBAddress,
    //       ERC20_ABI,
    //       provider
    //     );

    //     const [
    //       token0Symbol,
    //       token0Name,
    //       token0Decimals,
    //       token1Symbol,
    //       token1Name,
    //       token1Decimals,
    //     ] = await Promise.all([
    //       token0Contract.symbol(),
    //       token0Contract.name(),
    //       token0Contract.decimals(),
    //       token1Contract.symbol(),
    //       token1Contract.name(),
    //       token1Contract.decimals(),
    //     ]);
    //     const token0IsWeth = isWETHAddress(tokenAAddress, chainId);
    //     const token1IsWeth = isWETHAddress(tokenBAddress, chainId);

    //     let token0: Token = {
    //       address: tokenAAddress,
    //       symbol: token0IsWeth ? "ETH" : token0Symbol,
    //       name: token0IsWeth ? "Ethereum" : token0Name,
    //       decimals: token0Decimals,
    //       chainId,
    //       isNative: token0IsWeth,
    //     };

    //     let token1: Token = {
    //       address: tokenBAddress,
    //       symbol: token1IsWeth ? "ETH" : token1Symbol,
    //       name: token1IsWeth ? "Ethereum" : token1Name,
    //       chainId,
    //       decimals: token1Decimals,
    //       isNative: token1IsWeth,
    //     };

    //     // Get pair address
    //     const factoryContract = new ethers.Contract(
    //       FACTORY_ADDRESS(chainId),
    //       FACTORY_ABI,
    //       provider
    //     );

    //     const pairAddress = await factoryContract.getPair(
    //       tokenAAddress,
    //       tokenBAddress
    //     );

    //     if (pairAddress !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    //       // Existing pair
    //       const poolDetails = await get().fetchPoolDetails(
    //         provider,
    //         pairAddress,
    //         chainId
    //       );
    //       if (poolDetails) {
    //         set({
    //           selectedPool: poolDetails,
    //           selectedToken0: token0,
    //           selectedToken1: token1,
    //           isLoading: false,
    //         });
    //       } else {
    //         set({
    //           error: "Failed to load pool details",
    //           isLoading: false,
    //         });
    //       }
    //     } else {
    //       // New pair
    //       set({
    //         selectedPool: null,
    //         selectedToken0: token0,
    //         selectedToken1: token1,
    //         isLoading: false,
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error setting pair from addresses:", error);
    //     set({
    //       error:
    //         "Failed to load token pair. Please check the addresses and try again.",
    //       isLoading: false,
    //     });
    //   }
    // },
    setPairFromAddresses: async (
      provider,
      tokenAAddress,
      tokenBAddress,
      chainId
    ) => {
      try {
        set({ isLoading: true, error: null });
        // Check if tokens are WETH (to display as ETH)
        const token0IsWeth = isWETHAddress(tokenAAddress, chainId);
        const token1IsWeth = isWETHAddress(tokenBAddress, chainId);

        let token0, token1;

        if (token0IsWeth) {
          // Handle WETH as ETH
          token0 = {
            address: tokenAAddress, // Keep WETH address for contract calls
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
            chainId,
            isNative: true,
          };
        } else {
          // Load regular token details
          const token0Contract = new ethers.Contract(
            tokenAAddress,
            ERC20_ABI,
            provider
          );

          const [token0Symbol, token0Name, token0Decimals] = await Promise.all([
            token0Contract.symbol(),
            token0Contract.name(),
            token0Contract.decimals(),
          ]);

          token0 = {
            address: tokenAAddress,
            symbol: token0Symbol,
            name: token0Name,
            decimals: token0Decimals,
            chainId,
            isNative: false,
          };
        }

        if (token1IsWeth) {
          // Handle WETH as ETH
          token1 = {
            address: tokenBAddress, // Keep WETH address for contract calls
            symbol: "ETH",
            name: "Ethereum",
            decimals: 18,
            chainId,
            isNative: true,
          };
        } else {
          // Load regular token details
          const token1Contract = new ethers.Contract(
            tokenBAddress,
            ERC20_ABI,
            provider
          );

          const [token1Symbol, token1Name, token1Decimals] = await Promise.all([
            token1Contract.symbol(),
            token1Contract.name(),
            token1Contract.decimals(),
          ]);

          token1 = {
            address: tokenBAddress,
            symbol: token1Symbol,
            name: token1Name,
            decimals: token1Decimals,
            chainId,
            isNative: false,
          };
        }

        // Get pair address using the actual contract addresses (WETH addresses)
        const factoryContract = new ethers.Contract(
          FACTORY_ADDRESS(chainId),
          FACTORY_ABI,
          provider
        );

        const pairAddress = await factoryContract.getPair(
          tokenAAddress, // Use actual addresses for pair lookup
          tokenBAddress
        );

        // Check if pair exists (getPair returns zero address if doesn't exist)
        const zeroAddress = "0x0000000000000000000000000000000000000000";

        if (pairAddress !== zeroAddress) {
          // Existing pair
          const poolDetails = await get().fetchPoolDetails(
            provider,
            pairAddress,
            chainId
          );

          if (poolDetails) {
            set({
              selectedPool: poolDetails,
              selectedToken0: token0,
              selectedToken1: token1,
              isLoading: false,
            });
          } else {
            set({
              error: "Failed to load pool details",
              isLoading: false,
            });
          }
        } else {
          // New pair - no existing liquidity pool
          set({
            selectedPool: null,
            selectedToken0: token0,
            selectedToken1: token1,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error setting pair from addresses:", error);
        set({
          error:
            "Failed to load token pair. Please check the addresses and try again.",
          isLoading: false,
        });
      }
    },
    // Calculate token B amount based on token A input
    // calculateTokenBAmount: async (provider, tokenAAmount) => {
    //   const { selectedToken0, selectedToken1, selectedPool, setTokenBLoading } =
    //     get();

    //   let prices = usePriceStore.getState().prices;
    //   const updatePrices = usePriceStore.getState().updatePrices;
    //   if (!prices) {
    //     prices = await updatePrices();
    //   }
    //   if (!selectedToken0 || !tokenAAmount || parseFloat(tokenAAmount) === 0) {
    //     set({ tokenAAmount: "" });
    //     return;
    //   }

    //   try {
    //     set({ tokenBLoading: true, error: null });

    //     // If we have an existing pool, use the price ratio from reserves
    //     if (selectedPool) {
    //       const { reserves0, reserves1, token0, token1 } = selectedPool;

    //       let tokenBValue;
    //       if (selectedToken0.address === token0.address) {
    //         // Token A is token0
    //         const reserve0 = parseFloat(reserves0);
    //         const reserve1 = parseFloat(reserves1);
    //         if (reserve0 > 0) {
    //           tokenBValue = (parseFloat(tokenAAmount) * reserve1) / reserve0;
    //           // tokenBValue = formatUnits(tokenBValue, token1.decimals);
    //         } else {
    //           // New pool or empty reserves - need to use oracle price
    //           tokenBValue = await calculateFromOracle(tokenAAmount);
    //           // tokenBValue = formatUnits(tokenBValue, token1.decimals);
    //         }
    //       } else {
    //         // Token A is token1
    //         const reserve0 = parseFloat(reserves0);
    //         const reserve1 = parseFloat(reserves1);
    //         if (reserve1 > 0) {
    //           tokenBValue = (parseFloat(tokenAAmount) * reserve0) / reserve1;
    //           // tokenBValue = formatUnits(tokenBValue, token1.decimals);
    //         } else {
    //           // New pool or empty reserves - need to use oracle price
    //           tokenBValue = await calculateFromOracle(tokenAAmount);
    //           // tokenBValue = formatUnits(tokenBValue, token1.decimals);
    //         }
    //       }

    //       // set({
    //       //   tokenBAmount: String(tokenBValue),
    //       //   tokenAAmount,
    //       //   tokenBLoading: false,
    //       // });
    //       return { tokenAAmount, tokenBValue };
    //     } else {
    //       // No existing pool - use oracle prices
    //       const tokenBValue = await calculateFromOracle(tokenAAmount);
    //       set({
    //         tokenBAmount: tokenBValue.toFixed(6),
    //         tokenAAmount: tokenAAmount,
    //         tokenBLoading: false,
    //       });
    //       return { tokenAAmount, tokenBValue };
    //     }
    //   } catch (error) {
    //     console.error("Error calculating token B amount:", error);
    //     set({
    //       error: "Failed to calculate equivalent token amount",
    //       isLoading: false,
    //     });
    //   }

    //   // Internal function to calculate based on oracle prices
    //   async function calculateFromOracle(amountA: string): Promise<number> {
    //     // This would integrate with your price oracle system
    //     // For now, we'll use a placeholder implementation

    //     // Access your price state for both tokens
    //     // This assumes you have token prices in USD in a state like:
    //     // prices[`${tokenSymbol}_USD`] = priceInUsd

    //     // This should be integrated with your actual price store
    //     const priceStore = (window as any).getPriceStore?.() || {
    //       prices: {},
    //     };

    //     const tokenAPrice =
    //       priceStore.prices[`${selectedToken0?.symbol}_USD`] || 1;
    //     const tokenBPrice =
    //       priceStore.prices[`${selectedToken1?.symbol}_USD`] || 1;

    //     // Calculate equivalent value
    //     const valueInUsd = parseFloat(amountA) * tokenAPrice;
    //     return valueInUsd / tokenBPrice;
    //   }
    // },

    calculateTokenBAmount: async (provider, tokenAAmountRaw) => {
      const { selectedToken0, selectedToken1, selectedPool, setTokenBLoading } =
        get();
      if (!selectedToken0 || !selectedToken1) return;
      let { prices, updatePrices, getUSDValue } = usePriceStore.getState();

      if (!prices) {
        prices = await updatePrices();
      }

      if (
        !selectedToken0 ||
        !tokenAAmountRaw ||
        parseFloat(tokenAAmountRaw) === 0
      ) {
        set({ tokenAAmount: "" });
        return;
      }

      try {
        set({ tokenBLoading: true, error: null });

        if (selectedPool) {
          const { reserves0, reserves1, token0, token1 } = selectedPool;

          const decimals0 = token0.decimals;
          const decimals1 = token1.decimals;

          const reserve0 = getBigInt(parseUnits(reserves0, decimals0));
          const reserve1 = getBigInt(parseUnits(reserves1, decimals1));

          const tokenAAmount = getBigInt(
            parseUnits(tokenAAmountRaw, selectedToken0.decimals)
          );

          let tokenBValue: bigint;

          if (selectedToken0.address === token0.address) {
            // A is token0 → B = token1
            if (reserve0 > 0) {
              tokenBValue = (tokenAAmount * reserve1) / reserve0;
            } else {
              const oracleVal = await calculateFromOracle(tokenAAmountRaw);
              tokenBValue = getBigInt(
                parseUnits(oracleVal.toString(), token1.decimals)
              );
            }
          } else {
            // A is token1 → B = token0
            if (reserve1 > 0) {
              tokenBValue = (tokenAAmount * reserve0) / reserve1;
            } else {
              const oracleVal = await calculateFromOracle(tokenAAmountRaw);
              tokenBValue = getBigInt(
                parseUnits(oracleVal.toString(), token0.decimals)
              );
            }
          }

          const formattedTokenBValue = formatUnits(
            tokenBValue,
            selectedToken1.decimals
          );
          // const formattedTokenAValue = formatUnits(
          //   tokenAAmountRaw,
          //   selectedToken0.decimals
          // );
          // const tokenBUsdValue = await getUSDValue(
          //   formattedTokenBValue,
          //   selectedToken1.address
          // );
          // const tokenAUsdValue = await getUSDValue(
          //   formattedTokenAValue,
          //   selectedToken0.address
          // );
          // set({ tokenAUsdValue, tokenBUsdValue });
          return {
            tokenAAmount: tokenAAmountRaw,
            tokenBValue: formattedTokenBValue,
          };
        } else {
          // No pool, fallback to oracle
          const tokenBValue = await calculateFromOracle(tokenAAmountRaw);
          set({
            tokenBAmount: tokenBValue.toFixed(6),
            tokenAAmount: tokenAAmountRaw,
            tokenBLoading: false,
          });
          return { tokenAAmount: tokenAAmountRaw, tokenBValue };
        }
      } catch (error) {
        console.error("Error calculating token B amount:", error);
        set({
          error: "Failed to calculate equivalent token amount",
          isLoading: false,
        });
      }

      async function calculateFromOracle(amountA: string): Promise<number> {
        // This would integrate with your price oracle system
        // For now, we'll use a placeholder implementation

        // Access your price state for both tokens
        // This assumes you have token prices in USD in a state like:
        // prices[`${tokenSymbol}_USD`] = priceInUsd

        // This should be integrated with your actual price store
        const priceStore = (window as any).getPriceStore?.() || {
          prices: {},
        };

        const tokenAPrice =
          priceStore.prices[`${selectedToken0?.symbol}_USD`] || 1;
        const tokenBPrice =
          priceStore.prices[`${selectedToken1?.symbol}_USD`] || 1;

        // Calculate equivalent value
        const valueInUsd = parseFloat(amountA) * tokenAPrice;
        return valueInUsd / tokenBPrice;
      }
    },

    // Calculate token A amount based on token B input
    calculateTokenAAmount: async (provider, tokenBAmount) => {
      const { selectedToken0, selectedToken1, selectedPool } = get();
      let prices = usePriceStore.getState().prices;
      if (!selectedToken0 || !selectedToken1) return;
      const updatePrices = usePriceStore.getState().updatePrices;
      if (!prices) {
        prices = await updatePrices();
      }
      if (
        !selectedToken1 ||
        !selectedToken1 ||
        !tokenBAmount ||
        parseFloat(tokenBAmount) === 0
      ) {
        set({ tokenBAmount: "" });
        return;
      }

      try {
        set({ tokenALoading: true, error: null });

        // If we have an existing pool, use the price ratio from reserves
        if (selectedPool) {
          const { reserves0, reserves1, token1, token0 } = selectedPool;

          let tokenAValue;
          if (selectedToken1.address === token1.address) {
            // Token B is token0
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve0 > 0) {
              tokenAValue = (parseFloat(tokenBAmount) * reserve0) / reserve1;
              // tokenAValue = formatUnits(tokenAValue, token0.decimals);
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenAValue = await calculateFromOracle(tokenBAmount);
              // tokenAValue = formatUnits(tokenAValue, token0.decimals);
            }
          } else {
            // Token B is token1
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve1 > 0) {
              tokenAValue = (parseFloat(tokenBAmount) * reserve1) / reserve0;
              // tokenAValue = formatUnits(tokenAValue, token0.decimals);
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenAValue = await calculateFromOracle(tokenBAmount);
              // tokenAValue = formatUnits(tokenAValue, token0.decimals);
            }
          }
          // set({
          //   tokenAAmount: tokenAValue.toString(),
          //   tokenBAmount: tokenBAmount,
          //   tokenALoading: false,
          // });
          // const formattedTokenAValue = formatUnits(
          //   tokenAValue,
          //   selectedToken0.decimals
          // );
          // const formattedTokenBValue = formatUnits(
          //   tokenBAmount,
          //   selectedToken1.decimals
          // );
          // const tokenBUsdValue = await getUSDValue(
          //   formattedTokenBValue,
          //   selectedToken1.address
          // );
          // const tokenAUsdValue = await getUSDValue(
          //   formattedTokenAValue,
          //   selectedToken0.address
          // );
          // set({ tokenAUsdValue, tokenBUsdValue });
          return { tokenAValue, tokenBAmount };
        } else {
          // No existing pool - use oracle prices
          const tokenAValue = await calculateFromOracle(tokenBAmount);

          set({
            tokenAAmount: tokenAValue.toFixed(6),
            tokenALoading: false,
          });
          return { tokenAValue, tokenBAmount };
        }
      } catch (error) {
        console.error("Error calculating token A amount:", error);
        set({
          error: "Failed to calculate equivalent token amount",
          isLoading: false,
        });
      }

      // Internal function to calculate based on oracle prices
      async function calculateFromOracle(amountB: string): Promise<number> {
        // This would integrate with your price oracle system
        // For now, we'll use a placeholder implementation

        // Access your price state for both tokens
        // This assumes you have token prices in USD in a state like:
        // prices[`${tokenSymbol}_USD`] = priceInUsd

        // This should be integrated with your actual price store
        const priceStore = (window as any).getPriceStore?.() || {
          prices: {},
        };

        const tokenAPrice =
          priceStore.prices[`${selectedToken0?.symbol}_USD`] || 1;
        const tokenBPrice =
          priceStore.prices[`${selectedToken1?.symbol}_USD`] || 1;

        // Calculate equivalent value
        const valueInUsd = parseFloat(amountB) * tokenBPrice;
        return valueInUsd / tokenAPrice;
      }
    },

    // Calculate expected LP tokens for current input amounts
    calculateExpectedLpTokens: async (provider) => {
      const {
        selectedPool,
        selectedToken0,
        selectedToken1,
        tokenAAmount,
        tokenBAmount,
      } = get();

      if (
        !selectedPool ||
        !selectedToken0 ||
        !selectedToken1 ||
        !tokenAAmount ||
        !tokenBAmount
      ) {
        return "0";
      }
      try {
        const { reserves0, reserves1, totalSupply, token0, token1 } =
          selectedPool;

        // Convert string values to BigNumber
        const reserve0BN = BigInt(
          ethers.parseUnits(reserves0, token0.decimals)
        );
        const reserve1BN = BigInt(
          ethers.parseUnits(reserves1, token1.decimals)
        );
        const totalSupplyBN = BigInt(parseUnits(totalSupply, 18));

        // Convert input amounts to BigNumber
        // let amountABN, amountBBN;
        let tokenAIsToken0 = selectedToken0.address === token0.address;
        let amountABN, amountBBN;
        if (tokenAIsToken0) {
          amountABN = BigInt(ethers.parseUnits(tokenAAmount, token0.decimals));
          amountBBN = BigInt(ethers.parseUnits(tokenBAmount, token1.decimals));
        } else {
          amountABN = BigInt(ethers.parseUnits(tokenAAmount, token1.decimals));
          amountBBN = BigInt(ethers.parseUnits(tokenBAmount, token0.decimals));
        }

        // If the pool has no liquidity yet, the LP tokens will be sqrt(amountA * amountB)
        if (
          reserve0BN === BigInt(0) ||
          reserve1BN === BigInt(0) ||
          totalSupplyBN === BigInt(0)
        ) {
          const amountA = parseFloat(tokenAAmount);
          const amountB = parseFloat(tokenBAmount);

          // Calculate geometric mean and scale it to 18 decimals
          const sqrtAmount = Math.sqrt(amountA * amountB);
          const scaledSqrt = BigInt(Math.floor(sqrtAmount * 1e18)); // convert to BigInt

          set({ expectedLPToken: formatUnits(scaledSqrt, 18) });
          return formatUnits(scaledSqrt, 18); // ✅ safe formatting
        }

        // For existing pools, calculate the minimum LP tokens based on the ratio
        let lpTokenAmount: ethers.BigNumberish;

        if (tokenAIsToken0) {
          const lpFromA = (amountABN * totalSupplyBN) / reserve0BN;
          const lpFromB = (amountBBN * totalSupplyBN) / reserve1BN;
          lpTokenAmount = lpFromA < lpFromB ? lpFromA : lpFromB;
        } else {
          const lpFromA = (amountABN * totalSupplyBN) / reserve1BN;
          const lpFromB = (amountBBN * totalSupplyBN) / reserve0BN;
          lpTokenAmount = lpFromA < lpFromB ? lpFromA : lpFromB;
        }
        set({ expectedLPToken: formatUnits(lpTokenAmount, 18) });
        return formatUnits(lpTokenAmount, 18);
      } catch (error) {
        console.error("Error calculating expected LP tokens:", error);
        return "0";
      }
    },

    // Add liquidity

    // Remove liquidity

    setTransactionButtonText: (transactionText: string) =>
      set({ transactionButtonText: transactionText }),
  })
);

export const useLiqudityState = () =>
  useLiquidityStore(
    useShallow((state: LiquidityState) => ({
      pools: state.pools,
      selectedPool: state.selectedPool,
      selectedToken0: state.selectedToken0,
      selectedToken1: state.selectedToken1,
      tokenAAmount: state.tokenAAmount,
      tokenBAmount: state.tokenBAmount,
      lpTokenAmount: state.lpTokenAmount,
      percentToRemove: state.percentToRemove,
      isLoading: state.isLoading,
      error: state.error,
      isLoadingPools: state.isLoadingPools,
      isAddingLiquidity: state.isAddingLiquidity,
      isRemovingLiquidity: state.isRemovingLiquidity,
      totalPool: state.totalPool,
      totalTvl: state.totalTvl,
      isUserTokenbalance: state.isUserTokenbalance,
      selectedTokenABalance: state.selectedTokenABalance,
      selectedTokenBBalance: state.selectedTokenBBalance,
      expectedLPToken: state.expectedLPToken,
      tokenBUsdValue: state.tokenBUsdValue,
      tokenAUsdValue: state.tokenAUsdValue,
      tokenALoading: state.tokenALoading,
      tokenBLoading: state.tokenBLoading,
      transactionButtonText: state.transactionButtonText,
      transactionTokenAButtonText: state.transactionTokenAButtonText,
      transactionTokenBButtonText: state.transactionTokenBButtonText,
      needsApprovalTokenA: state.needsApprovalTokenA,
      isApprovingTokenA: state.isApprovingTokenA,
      needsApprovalTokenB: state.needsApprovalTokenB,
      needsApprovalLP: state.needsApprovalLP,
      isApprovingTokenB: state.isApprovingTokenB,
      deadline: state.deadline,
      slippage: state.slippage,
      isLpApproving: state.isLpApproving,
      transactionRemoveLiquidityText: state.transactionRemoveLiquidityText,
      defaultLiquidityTag: state.defaultLiquidityTag,
    }))
  );

// Selector for Actions Only
export const useLiquidityActions = () =>
  useLiquidityStore(
    useShallow((state: LiquidityActions) => ({
      setToken0: state.setToken0,
      setToken1: state.setToken1,
      setTransactionButtonText: state.setTransactionButtonText,
      setTransactionTokenAButtonText: state.setTransactionTokenAButtonText,
      setTransactionTokenBButtonText: state.setTransactionTokenBButtonText,
      setDefaultLiquidityTag: state.setDefaultLiquidityTag,
      setTokenAAmount: state.setTokenAAmount,
      setTokenBAmount: state.setTokenBAmount,
      setLpTokenAmount: state.setLpTokenAmount,
      setIsLpApproving: state.setIsLpApproving,
      setPercentToRemove: state.setPercentToRemove,
      setSelectedPool: state.setSelectedPool,
      fetchPools: state.fetchPools,
      fetchPoolDetails: state.fetchPoolDetails,
      calculateTokenBAmount: state.calculateTokenBAmount,
      calculateTokenAAmount: state.calculateTokenAAmount,
      setError: state.setError,
      // addLiquidity: state.addLiquidity,
      setIsRemovingLiquidity: state.setIsRemovingLiquidity,
      setTransactionRemoveLiquidityText:
        state.setTransactionRemoveLiquidityText,
      // removeLiquidity: state.removeLiquidity,
      resetForm: state.resetForm,
      setPairFromAddresses: state.setPairFromAddresses,
      getUserBalances: state.getUserBalances,
      calculateExpectedLpTokens: state.calculateExpectedLpTokens,
      setTokenALoading: state.setTokenALoading,
      setTokenBLoading: state.setTokenBLoading,
      // setNeedsApproval: state.setNeedsApproval,
      // setIsApproving: state.setIsApproving,
      setNeedsApprovalTokenA: state.setNeedsApprovalTokenA,
      setIsApprovingTokenA: state.setIsApprovingTokenA,
      setNeedsApprovalTokenB: state.setNeedsApprovalTokenB,
      setNeedsApprovalLP: state.setNeedsApprovalLP,
      setIsApprovingTokenB: state.setIsApprovingTokenB,
      setisAddingLiquidity: state.setisAddingLiquidity,
      setDeadline: state.setDeadline,
      setSlippage: state.setSlippage,
    }))
  );
