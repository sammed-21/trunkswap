/// start new zustand store

import { create } from "zustand";
import { ethers, formatEther } from "ethers";
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
  FactoryAddressChainId,
  ROUTER_ADDRESS,
} from "@/lib/constants";

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
  pools: Pool[];
  selectedPool: Pool | null;
  selectedTokenA: Token | null;
  selectedTokenB: Token | null;
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

  // Loading states
  isUserTokenbalance: boolean;
  isLoadingPools: boolean;
  isAddingLiquidity: boolean;
  isRemovingLiquidity: boolean;
}
export interface LiquidityActions {
  // Actions
  setTokenA: (token: Token | null) => void;
  setTokenB: (token: Token | null) => void;
  setTokenAAmount: (amount: string) => void;
  setTokenBAmount: (amount: string) => void;
  setLpTokenAmount: (amount: string) => void;
  setTokenALoading: (loading: boolean) => void;
  setDeadline: (value: number) => void;
  setSlippage: (value: number) => void;
  setTokenBLoading: (loading: boolean) => void;
  setPercentToRemove: (percent: number) => void;
  setSelectedPool: (pool: Pool | null) => void;
  setTransactionButtonText: (transactionButtonText: string) => void;
  getUserBalances: (userAdddress: string) => Promise<any>;
  // setNeedsApproval: (needsApproval: boolean) => void;
  // setIsApproving: (isApproving: boolean) => void;
  setNeedsApprovalTokenA: (needsApprovalTokenA: boolean) => void;
  setTransactionTokenAButtonText: (transactionTokenAButtonText: string) => void;
  setTransactionTokenBButtonText: (transactionTokenBButtonText: string) => void;
  setIsApprovingTokenA: (needsApprovalTokenA: boolean) => void;
  setNeedsApprovalTokenB: (needsApprovalTokenB: boolean) => void;
  setIsApprovingTokenB: (needsApprovalTokenB: boolean) => void;
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
  removeLiquidity: (provider: ethers.Signer) => Promise<string | null>;

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
    pools: [],
    transactionButtonText: "Add Liquidity",
    transactionTokenAButtonText: "",
    deadline: 20,
    transactionTokenBButtonText: "",
    selectedPool: null,
    selectedTokenA: null,
    selectedTokenB: null,
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
    totalPool: 0,
    totalTvl: 0,
    expectedLPToken: "0",
    tokenAUsdValue: 0,
    tokenBUsdValue: 0,
    // needsApproval: false,
    // isApproving: false,
    needsApprovalTokenA: false,
    isApprovingTokenA: false,
    needsApprovalTokenB: false,
    isApprovingTokenB: false,

    isLoadingPools: false,
    isUserTokenbalance: false,
    isAddingLiquidity: false,
    isRemovingLiquidity: false,

    // Token selection
    setTokenA: (token) => {
      set({
        selectedTokenA: token,
        tokenAAmount: "",
        tokenBAmount: "",
      });
    },

    setTokenB: (token) => {
      set({
        selectedTokenB: token,
        tokenAAmount: "",
        tokenBAmount: "",
      });
    },

    // Input handling
    // setNeedsApproval: (needsApproval: boolean) => set({ needsApproval }),
    // setIsApproving: (isApproving: boolean) => set({ isApproving }),
    setDeadline: (value: number) => set({ deadline: value }),
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
    setIsApprovingTokenB: (needsApprovalTokenB: boolean) =>
      set({ needsApprovalTokenB }),
    setTokenAAmount: (amount: string) => set({ tokenAAmount: amount }),
    setTokenBAmount: (amount: string) => set({ tokenBAmount: amount }),
    setLpTokenAmount: (amount) => set({ lpTokenAmount: amount }),
    setPercentToRemove: (percent) => set({ percentToRemove: percent }),
    setSelectedPool: (pool) => set({ selectedPool: pool }),
    setTokenALoading: (loading: boolean) => set({ tokenALoading: loading }),
    setTokenBLoading: (loading: boolean) => set({ tokenBLoading: loading }),
    // Form reset
    resetForm: () =>
      set({
        tokenAAmount: "",
        tokenBAmount: "",
        lpTokenAmount: "",
        percentToRemove: 0,
        error: null,
        // selectedPool: null,
        // selectedTokenA: null,
        // selectedTokenB: null,
        transactionButtonText: "Add Liquidity",
        isAddingLiquidity: false,
        selectedTokenABalance: "",
        selectedTokenBBalance: "",
        isApprovingTokenA: false,
        isApprovingTokenB: false,
        transactionTokenBButtonText: "",
        transactionTokenAButtonText: "",
        needsApprovalTokenA: false,
        needsApprovalTokenB: false,

        isLoading: false,

        totalPool: 0,
        totalTvl: 0,
        expectedLPToken: "0",
      }),

    // Fetch all pools
    fetchPools: async (provider) => {
      const chainId = useAccountStore.getState().chainId;
      try {
        set({ isLoadingPools: true, error: null });
        if (!provider) return;

        const factoryContract = new ethers.Contract(
          FACTORY_ADDRESS(chainId),
          FACTORY_ABI,
          provider
        );

        // Get all pairs created by the factory
        const pairCount = await factoryContract.allPairsLength();
        const poolsPromises = [];

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

        // Get user's LP balance
        let userLpBalance;
        let formatedUserLpBalance;
        // if (userAddress) {
        //   userLpBalance = await pairContract?.balanceOf(userAddress);
        //   formatedUserLpBalance = formatUnits(userLpBalance, 18);
        // }

        // Create token objects
        const token0: Token = {
          address: token0Address,
          symbol: token0Symbol,
          name: token0Name,
          decimals: token0Decimals,
          chainId: chainId,
        };

        const token1: Token = {
          address: token1Address,
          symbol: token1Symbol,
          name: token1Name,
          decimals: token1Decimals,
          chainId,
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
          totalSupply: totalSupply,
          // userLpBalance: formatedUserLpBalance,
          token0Price,
          token1Price,
          tvl,
        };
      } catch (error) {
        console.error("Error fetching pool details:", error);
        return null;
      }
    },
    getUserBalances: async (userAddress: string) => {
      try {
        const { selectedTokenA, selectedTokenB } = get();
        let provider = useAccountStore.getState().provider;
        if (!provider) return;
        if (!userAddress || !selectedTokenA || !selectedTokenB) return;

        let tokens;
        tokens = useSwapStore.getState().tokens;

        set({ isUserTokenbalance: true });

        // ✅ Fetch from the other store if tokens are not loaded
        if (!tokens || tokens.length === 0) {
          const fetchAllTokens = useSwapStore.getState().fetchAllTokens;
          tokens = await fetchAllTokens(userAddress, provider);

          // 🔁 Update local copy after external fetch
        }
        if (!tokens) return;

        let balanceA = tokens.find(
          (t: Token) =>
            t.symbol.toLowerCase() === selectedTokenA.symbol.toLowerCase()
        );
        let balanceB = tokens.find(
          (t: Token) =>
            t.symbol.toLowerCase() === selectedTokenB.symbol.toLowerCase()
        );

        // 🔄 Fetch balances if not available
        if (balanceA && balanceA.balance === undefined) {
          const bal = await fetchTokenBalance(
            balanceA.address,
            userAddress,
            provider,
            balanceA.decimals
          );
          balanceA = { ...balanceA, balance: bal };
        }

        if (balanceB && balanceB.balance === undefined) {
          const bal = await fetchTokenBalance(
            balanceB.address,
            userAddress,
            provider,
            balanceB.decimals
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
    setPairFromAddresses: async (
      provider,
      tokenAAddress,
      tokenBAddress,
      chainId
    ) => {
      try {
        const tokens = useSwapStore.getState().tokens;
        const chaindId = useAccountStore.getState().chainId;
        const userAddress = useAccountStore.getState().address;
        set({ isLoading: true, error: null });

        // Load token details
        const tokenAContract = new ethers.Contract(
          tokenAAddress,
          ERC20_ABI,
          provider
        );
        const tokenBContract = new ethers.Contract(
          tokenBAddress,
          ERC20_ABI,
          provider
        );

        const [
          tokenASymbol,
          tokenAName,
          tokenADecimals,
          tokenBSymbol,
          tokenBName,
          tokenBDecimals,
        ] = await Promise.all([
          tokenAContract.symbol(),
          tokenAContract.name(),
          tokenAContract.decimals(),
          tokenBContract.symbol(),
          tokenBContract.name(),
          tokenBContract.decimals(),
        ]);

        let tokenA: Token = {
          address: tokenAAddress,
          symbol: tokenASymbol,
          name: tokenAName,
          decimals: tokenADecimals,
          chainId,
        };

        let tokenB: Token = {
          address: tokenBAddress,
          symbol: tokenBSymbol,
          name: tokenBName,
          chainId,
          decimals: tokenBDecimals,
        };

        // Get pair address
        const factoryContract = new ethers.Contract(
          FACTORY_ADDRESS(chainId),
          FACTORY_ABI,
          provider
        );

        const pairAddress = await factoryContract.getPair(
          tokenAAddress,
          tokenBAddress
        );

        if (pairAddress !== ethers.ZeroAddress) {
          // Existing pair
          const poolDetails = await get().fetchPoolDetails(
            provider,
            pairAddress,
            chainId
          );
          if (poolDetails) {
            set({
              selectedPool: poolDetails,
              selectedTokenA: tokenA,
              selectedTokenB: tokenB,
              isLoading: false,
            });
          } else {
            set({
              error: "Failed to load pool details",
              isLoading: false,
            });
          }
        } else {
          // New pair
          set({
            selectedPool: null,
            selectedTokenA: tokenA,
            selectedTokenB: tokenB,
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
    calculateTokenBAmount: async (provider, tokenAAmount) => {
      const { selectedTokenA, selectedTokenB, selectedPool, setTokenBLoading } =
        get();

      let prices = usePriceStore.getState().prices;
      const updatePrices = usePriceStore.getState().updatePrices;
      if (!prices) {
        prices = await updatePrices();
      }
      if (!selectedTokenA || !tokenAAmount || parseFloat(tokenAAmount) === 0) {
        set({ tokenAAmount: "" });
        return;
      }

      try {
        set({ tokenBLoading: true, error: null });

        // If we have an existing pool, use the price ratio from reserves
        if (selectedPool) {
          const { reserves0, reserves1, token0, token1 } = selectedPool;

          let tokenBValue;
          if (selectedTokenA.address === token0.address) {
            // Token A is token0
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve0 > 0) {
              tokenBValue = (parseFloat(tokenAAmount) * reserve1) / reserve0;
              // tokenBValue = formatUnits(tokenBValue, token1.decimals);
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenBValue = await calculateFromOracle(tokenAAmount);
              // tokenBValue = formatUnits(tokenBValue, token1.decimals);
            }
          } else {
            // Token A is token1
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve1 > 0) {
              tokenBValue = (parseFloat(tokenAAmount) * reserve0) / reserve1;
              // tokenBValue = formatUnits(tokenBValue, token1.decimals);
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenBValue = await calculateFromOracle(tokenAAmount);
              // tokenBValue = formatUnits(tokenBValue, token1.decimals);
            }
          }

          // set({
          //   tokenBAmount: String(tokenBValue),
          //   tokenAAmount,
          //   tokenBLoading: false,
          // });
          return { tokenAAmount, tokenBValue };
        } else {
          // No existing pool - use oracle prices
          const tokenBValue = await calculateFromOracle(tokenAAmount);
          set({
            tokenBAmount: tokenBValue.toFixed(6),
            tokenAAmount: tokenAAmount,
            tokenBLoading: false,
          });
          return { tokenAAmount, tokenBValue };
        }
      } catch (error) {
        console.error("Error calculating token B amount:", error);
        set({
          error: "Failed to calculate equivalent token amount",
          isLoading: false,
        });
      }

      // Internal function to calculate based on oracle prices
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
          priceStore.prices[`${selectedTokenA?.symbol}_USD`] || 1;
        const tokenBPrice =
          priceStore.prices[`${selectedTokenB?.symbol}_USD`] || 1;

        // Calculate equivalent value
        const valueInUsd = parseFloat(amountA) * tokenAPrice;
        return valueInUsd / tokenBPrice;
      }
    },

    // Calculate token A amount based on token B input
    calculateTokenAAmount: async (provider, tokenBAmount) => {
      const { selectedTokenA, selectedTokenB, selectedPool } = get();
      let prices = usePriceStore.getState().prices;

      const updatePrices = usePriceStore.getState().updatePrices;
      if (!prices) {
        prices = await updatePrices();
      }
      if (
        !selectedTokenB ||
        !selectedTokenB ||
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
          if (selectedTokenB.address === token1.address) {
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
          priceStore.prices[`${selectedTokenA?.symbol}_USD`] || 1;
        const tokenBPrice =
          priceStore.prices[`${selectedTokenB?.symbol}_USD`] || 1;

        // Calculate equivalent value
        const valueInUsd = parseFloat(amountB) * tokenBPrice;
        return valueInUsd / tokenAPrice;
      }
    },

    // Calculate expected LP tokens for current input amounts
    calculateExpectedLpTokens: async (provider) => {
      const {
        selectedPool,
        selectedTokenA,
        selectedTokenB,
        tokenAAmount,
        tokenBAmount,
      } = get();

      if (
        !selectedPool ||
        !selectedTokenA ||
        !selectedTokenB ||
        !tokenAAmount ||
        !tokenBAmount
      ) {
        return "0";
      }
      try {
        const { reserves0, reserves1, totalSupply, token0, token1 } =
          selectedPool;

        // Convert string values to BigNumber
        const reserve0BN = ethers.parseUnits(reserves0, token0.decimals);
        const reserve1BN = ethers.parseUnits(reserves1, token1.decimals);
        const totalSupplyBN = BigInt(totalSupply);

        // Convert input amounts to BigNumber
        let amountABN, amountBBN;
        let tokenAIsToken0 = selectedTokenA.address === token0.address;

        if (tokenAIsToken0) {
          amountABN = ethers.parseUnits(tokenAAmount, token0.decimals);
          amountBBN = ethers.parseUnits(tokenBAmount, token1.decimals);
        } else {
          amountABN = ethers.parseUnits(tokenAAmount, token1.decimals);
          amountBBN = ethers.parseUnits(tokenBAmount, token0.decimals);
        }

        // If the pool has no liquidity yet, the LP tokens will be sqrt(amountA * amountB)
        if (
          reserve0BN == BigInt(0) ||
          reserve1BN == BigInt(0) ||
          totalSupplyBN == BigInt(0)
        ) {
          // For a new pool, return the geometric mean of the amounts
          // LP tokens have 18 decimals regardless of token decimals
          const amountA = parseFloat(tokenAAmount);
          const amountB = parseFloat(tokenBAmount);
          return Math.sqrt(amountA * amountB).toString();
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
    removeLiquidity: async (signer) => {
      let chainId = useAccountStore.getState().chainId;
      const { selectedPool, percentToRemove } = get();
      let routerAddress = ROUTER_ADDRESS(chainId);
      const provider = useAccountStore.getState().provider;
      if (provider) return null;
      if (!selectedPool || percentToRemove <= 0 || percentToRemove > 100) {
        set({ error: "Please select a valid amount to remove" });
        return null;
      }

      try {
        set({ isRemovingLiquidity: true, error: null });

        const routerContract = new ethers.Contract(
          routerAddress,
          ROUTER_ABI,
          signer
        );
        const pairContract = new ethers.Contract(
          selectedPool.pairAddress,
          PAIR_ABI,
          signer
        );

        const userAddress = await signer.getAddress();

        // Calculate LP tokens to remove

        const userLpBalanceBN = ethers.parseUnits(
          selectedPool?.userLpBalance!,
          18
        );
        const lpToRemove =
          (Number(userLpBalanceBN) * Math.floor(percentToRemove)) / 100;

        if (lpToRemove === 0) {
          set({
            error: "You don't have any liquidity to remove",
            isRemovingLiquidity: false,
          });
          return null;
        }

        // Approve LP tokens if needed
        const allowance = await pairContract.allowance(
          userAddress,
          routerAddress
        );
        if (allowance < lpToRemove) {
          const approveTx = await pairContract.approve(
            routerAddress,
            ethers.MaxUint256
          );
          await approveTx.wait();
        }

        // Calculate minimum amounts (with 0.5% slippage)
        const reserves = await pairContract.getReserves();
        const totalSupply = await pairContract.totalSupply();

        const amount0Min = reserves._reserve0
          .mul(lpToRemove)
          .div(totalSupply)
          .mul(995)
          .div(1000);
        const amount1Min = reserves._reserve1
          .mul(lpToRemove)
          .div(totalSupply)
          .mul(995)
          .div(1000);

        // Deadline 20 minutes from now
        const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

        // Remove liquidity
        const tx = await routerContract.removeLiquidity.staticCall(
          selectedPool.token0.address,
          selectedPool.token1.address,
          lpToRemove,
          amount0Min,
          amount1Min,
          userAddress,
          deadline,
          { gasLimit: 3000000 }
        );

        const receipt = await tx.wait();

        // Reset form after successful transaction
        get().resetForm();

        // Refresh pools
        await get().fetchPools(provider!);

        set({ isRemovingLiquidity: false });
        return receipt.transactionHash;
      } catch (error) {
        console.error("Error removing liquidity:", error);
        set({
          error: "Failed to remove liquidity. Please try again.",
          isRemovingLiquidity: false,
        });
        return null;
      }
    },
    setTransactionButtonText: (transactionText: string) =>
      set({ transactionButtonText: transactionText }),
  })
);

export const useLiqudityState = () =>
  useLiquidityStore(
    useShallow((state: LiquidityState) => ({
      pools: state.pools,
      selectedPool: state.selectedPool,
      selectedTokenA: state.selectedTokenA,
      selectedTokenB: state.selectedTokenB,
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
      isApprovingTokenB: state.isApprovingTokenB,
      deadline: state.deadline,
      slippage: state.slippage,
    }))
  );

// Selector for Actions Only
export const useLiquidityActions = () =>
  useLiquidityStore(
    useShallow((state: LiquidityActions) => ({
      setTokenA: state.setTokenA,
      setTokenB: state.setTokenB,
      setTransactionButtonText: state.setTransactionButtonText,
      setTransactionTokenAButtonText: state.setTransactionTokenAButtonText,
      setTransactionTokenBButtonText: state.setTransactionTokenBButtonText,

      setTokenAAmount: state.setTokenAAmount,
      setTokenBAmount: state.setTokenBAmount,
      setLpTokenAmount: state.setLpTokenAmount,
      setPercentToRemove: state.setPercentToRemove,
      setSelectedPool: state.setSelectedPool,
      fetchPools: state.fetchPools,
      fetchPoolDetails: state.fetchPoolDetails,
      calculateTokenBAmount: state.calculateTokenBAmount,
      calculateTokenAAmount: state.calculateTokenAAmount,
      // addLiquidity: state.addLiquidity,
      removeLiquidity: state.removeLiquidity,
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
      setIsApprovingTokenB: state.setIsApprovingTokenB,
      setisAddingLiquidity: state.setisAddingLiquidity,
      setDeadline: state.setDeadline,
      setSlippage: state.setSlippage,
    }))
  );
