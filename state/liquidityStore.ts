/// start new zustand store

import { create } from "zustand";
import { ethers } from "ethers";
import { persist } from "zustand/middleware";
import { formatUnits, parseUnits } from "ethers";

// Import ABIs
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { useAccountState, useAccountStore } from "./accountStore";
import { useShallow } from "zustand/shallow";

// Types
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

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
}

export interface LiquidityState {
  // State variables
  pools: Pool[];
  selectedPool: Pool | null;
  selectedTokenA: Token | null;
  selectedTokenB: Token | null;
  tokenAAmount: string;
  tokenBAmount: string;
  lpTokenAmount: string;
  percentToRemove: number;
  isLoading: boolean;
  error: string | null;

  // Contract addresses
  factoryAddress: string;
  routerAddress: string;

  // Loading states
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
  setPercentToRemove: (percent: number) => void;
  setSelectedPool: (pool: Pool | null) => void;

  // Pool operations
  fetchPools: (provider: ethers.Provider) => Promise<void>;
  fetchPoolDetails: (
    provider: ethers.Provider,
    pairAddress: string
  ) => Promise<Pool | null>;
  calculateTokenBAmount: (
    provider: ethers.Provider,
    tokenAAmount: string
  ) => Promise<void>;
  calculateTokenAAmount: (
    provider: ethers.Provider,
    tokenBAmount: string
  ) => Promise<void>;

  // Liquidity operations
  addLiquidity: (signer: ethers.Signer) => Promise<string | null>;
  removeLiquidity: (provider: ethers.Signer) => Promise<string | null>;

  // Utility functions
  resetForm: () => void;
  setPairFromAddresses: (
    provider: ethers.Provider,
    tokenAAddress: string,
    tokenBAddress: string
  ) => Promise<void>;
  calculateExpectedLpTokens: (provider: ethers.Provider) => Promise<string>;
}

// Constants
const FACTORY_ADDRES = "0xD73c96023dd38ceF2fB7bc6A5dF7C99E734cb471"; // Replace with your factory address
const ROUTER_ADDRES = "0x8983097150471FbbA0e0be8A49398D9F8744dD5C"; // Replace with your router address
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const useLiquidityStore = create<LiquidityState & LiquidityActions>(
  (set, get) => ({
    // Initial state
    pools: [],
    selectedPool: null,
    selectedTokenA: null,
    selectedTokenB: null,
    tokenAAmount: "",
    tokenBAmount: "",
    lpTokenAmount: "",
    percentToRemove: 0,
    isLoading: false,
    error: null,

    factoryAddress: FACTORY_ADDRES,
    routerAddress: ROUTER_ADDRES,

    isLoadingPools: false,
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
    setTokenAAmount: (amount) => set({ tokenAAmount: amount }),
    setTokenBAmount: (amount) => set({ tokenBAmount: amount }),
    setLpTokenAmount: (amount) => set({ lpTokenAmount: amount }),
    setPercentToRemove: (percent) => set({ percentToRemove: percent }),
    setSelectedPool: (pool) => set({ selectedPool: pool }),

    // Form reset
    resetForm: () =>
      set({
        tokenAAmount: "",
        tokenBAmount: "",
        lpTokenAmount: "",
        percentToRemove: 0,
        error: null,
      }),

    // Fetch all pools
    fetchPools: async (provider) => {
      try {
        set({ isLoadingPools: true, error: null });
        if (!provider) return;

        const factoryContract = new ethers.Contract(
          get().factoryAddress,
          FACTORY_ABI,
          provider
        );

        // Get all pairs created by the factory
        const pairCount = await factoryContract.allPairsLength();
        const poolsPromises = [];

        for (let i = 0; i < pairCount.toNumber(); i++) {
          poolsPromises.push(
            (async () => {
              try {
                const pairAddress = await factoryContract.allPairs(i);
                const poolDetails = await get().fetchPoolDetails(
                  provider,
                  pairAddress
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
        set({ pools, isLoadingPools: false });
      } catch (error) {
        console.error("Error fetching pools:", error);
        set({
          error:
            "Failed to load pools. Please check your connection and try again.",
          isLoadingPools: false,
        });
      }
    },

    // Fetch details for a specific pool
    fetchPoolDetails: async (provider, pairAddress) => {
      try {
        const userAddress = useAccountStore?.getState().signer;

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
        if (userAddress) {
          userLpBalance = await pairContract?.balanceOf(userAddress);
          formatedUserLpBalance = formatUnits(userLpBalance, 18);
        }

        // Create token objects
        const token0: Token = {
          address: token0Address,
          symbol: token0Symbol,
          name: token0Name,
          decimals: token0Decimals,
        };

        const token1: Token = {
          address: token1Address,
          symbol: token1Symbol,
          name: token1Name,
          decimals: token1Decimals,
        };

        // Calculate prices from reserves
        const reserve0 = reserves[0];
        const reserve1 = reserves[1];
        const token1Price =
          reserve1 > 0
            ? formatUnits(
                (reserve0 * ethers.parseUnits("1", token1Decimals)) / reserve1,
                token0Decimals
              )
            : "0";
        const token0Price =
          reserve0 > 0
            ? formatUnits(
                (reserve1 * ethers.parseUnits("1", token0Decimals)) / reserve0,
                token1Decimals
              )
            : "0";

        return {
          pairAddress,
          token0,
          token1,
          reserves0: formatUnits(reserve0, token0Decimals),
          reserves1: formatUnits(reserve1, token1Decimals),
          totalSupply: formatUnits(totalSupply, 18),
          userLpBalance: formatedUserLpBalance,
          token0Price,
          token1Price,
        };
      } catch (error) {
        console.error("Error fetching pool details:", error);
        return null;
      }
    },

    // Set pair from token addresses
    setPairFromAddresses: async (provider, tokenAAddress, tokenBAddress) => {
      try {
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

        const tokenA = {
          address: tokenAAddress,
          symbol: tokenASymbol,
          name: tokenAName,
          decimals: tokenADecimals,
        };

        const tokenB = {
          address: tokenBAddress,
          symbol: tokenBSymbol,
          name: tokenBName,
          decimals: tokenBDecimals,
        };

        // Get pair address
        const factoryContract = new ethers.Contract(
          get().factoryAddress,
          FACTORY_ABI,
          provider
        );

        const pairAddress = await factoryContract.getPair(
          tokenAAddress,
          tokenBAddress
        );

        if (pairAddress !== ZERO_ADDRESS) {
          // Existing pair
          const poolDetails = await get().fetchPoolDetails(
            provider,
            pairAddress
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
      const { selectedTokenA, selectedTokenB, selectedPool } = get();

      if (
        !selectedTokenA ||
        !selectedTokenB ||
        !tokenAAmount ||
        parseFloat(tokenAAmount) === 0
      ) {
        set({ tokenBAmount: "" });
        return;
      }

      try {
        set({ isLoading: true, error: null });

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
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenBValue = await calculateFromOracle(tokenAAmount);
            }
          } else {
            // Token A is token1
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve1 > 0) {
              tokenBValue = (parseFloat(tokenAAmount) * reserve0) / reserve1;
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenBValue = await calculateFromOracle(tokenAAmount);
            }
          }

          set({
            tokenBAmount: tokenBValue.toFixed(6),
            isLoading: false,
          });
        } else {
          // No existing pool - use oracle prices
          const tokenBValue = await calculateFromOracle(tokenAAmount);
          set({
            tokenBAmount: tokenBValue.toFixed(6),
            isLoading: false,
          });
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

      if (
        !selectedTokenA ||
        !selectedTokenB ||
        !tokenBAmount ||
        parseFloat(tokenBAmount) === 0
      ) {
        set({ tokenAAmount: "" });
        return;
      }

      try {
        set({ isLoading: true, error: null });

        // If we have an existing pool, use the price ratio from reserves
        if (selectedPool) {
          const { reserves0, reserves1, token0, token1 } = selectedPool;

          let tokenAValue;
          if (selectedTokenB.address === token0.address) {
            // Token B is token0
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve0 > 0) {
              tokenAValue = (parseFloat(tokenBAmount) * reserve1) / reserve0;
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenAValue = await calculateFromOracle(tokenBAmount);
            }
          } else {
            // Token B is token1
            const reserve0 = parseFloat(reserves0);
            const reserve1 = parseFloat(reserves1);
            if (reserve1 > 0) {
              tokenAValue = (parseFloat(tokenBAmount) * reserve0) / reserve1;
            } else {
              // New pool or empty reserves - need to use oracle price
              tokenAValue = await calculateFromOracle(tokenBAmount);
            }
          }

          set({
            tokenAAmount: tokenAValue.toFixed(6),
            isLoading: false,
          });
        } else {
          // No existing pool - use oracle prices
          const tokenAValue = await calculateFromOracle(tokenBAmount);
          set({
            tokenAAmount: tokenAValue.toFixed(6),
            isLoading: false,
          });
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
        const totalSupplyBN = ethers.parseUnits(totalSupply, 18);

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

        return formatUnits(lpTokenAmount, 18);
      } catch (error) {
        console.error("Error calculating expected LP tokens:", error);
        return "0";
      }
    },

    // Add liquidity
    addLiquidity: async (signer: ethers.Signer) => {
      const {
        selectedTokenA,
        selectedTokenB,
        tokenAAmount,
        tokenBAmount,
        routerAddress,
      } = get();
      const provider = useAccountStore.getState().provider;
      if (!provider) return null;
      if (
        !selectedTokenA ||
        !selectedTokenB ||
        !tokenAAmount ||
        !tokenBAmount
      ) {
        set({ error: "Please enter valid token amounts" });
        return null;
      }

      try {
        set({ isAddingLiquidity: true, error: null });

        const routerContract = new ethers.Contract(
          routerAddress,
          ROUTER_ABI,
          signer
        );

        // Approve tokens if needed
        const tokenAContract = new ethers.Contract(
          selectedTokenA.address,
          ERC20_ABI,
          signer
        );
        const tokenBContract = new ethers.Contract(
          selectedTokenB.address,
          ERC20_ABI,
          signer
        );

        const userAddress = await signer.getAddress();

        const amountA = ethers.parseUnits(
          tokenAAmount,
          selectedTokenA.decimals
        );
        const amountB = ethers.parseUnits(
          tokenBAmount,
          selectedTokenB.decimals
        );

        // Check allowances
        const allowanceA = await tokenAContract.allowance(
          userAddress,
          routerAddress
        );
        const allowanceB = await tokenBContract.allowance(
          userAddress,
          routerAddress
        );

        // Approve Token A if needed
        if (allowanceA < amountA) {
          const approveTxA = await tokenAContract.approve(
            routerAddress,
            ethers.MaxUint256
          );
          await approveTxA.wait();
        }

        // Approve Token B if needed
        if (allowanceB < amountB) {
          const approveTxB = await tokenBContract.approve(
            routerAddress,
            ethers.MaxUint256
          );
          await approveTxB.wait();
        }

        // Calculate minimum amounts (with 0.5% slippage)
        const amountAMin = (Number(amountA) * 995) / 1000;
        const amountBMin = (Number(amountB) * 995) / 1000;

        // Deadline 20 minutes from now
        const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

        // Add liquidity
        const tx = await routerContract.addLiquidity.staticCall(
          selectedTokenA.address,
          selectedTokenB.address,
          amountA,
          amountB,
          amountAMin,
          amountBMin,
          userAddress,
          deadline,
          { gasLimit: 3000000 }
        );
        const receipt = await tx.wait();

        // Reset form after successful transaction
        get().resetForm();

        // Refresh pools
        await get().fetchPools(provider);

        set({ isAddingLiquidity: false });
        return receipt.transactionHash;
      } catch (error) {
        console.error("Error adding liquidity:", error);
        set({
          error: "Failed to add liquidity. Please try again.",
          isAddingLiquidity: false,
        });
        return null;
      }
    },

    // Remove liquidity
    removeLiquidity: async (signer) => {
      const { selectedPool, percentToRemove, routerAddress } = get();
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
      factoryAddress: state.factoryAddress,
      routerAddress: state.routerAddress,
      isLoadingPools: state.isLoadingPools,
      isAddingLiquidity: state.isAddingLiquidity,
      isRemovingLiquidity: state.isRemovingLiquidity,
    }))
  );

// Selector for Actions Only
export const useLiquidityActions = () =>
  useLiquidityStore(
    useShallow((state: LiquidityActions) => ({
      setTokenA: state.setTokenA,
      setTokenB: state.setTokenB,
      setTokenAAmount: state.setTokenAAmount,
      setTokenBAmount: state.setTokenBAmount,
      setLpTokenAmount: state.setLpTokenAmount,
      setPercentToRemove: state.setPercentToRemove,
      setSelectedPool: state.setSelectedPool,
      fetchPools: state.fetchPools,
      fetchPoolDetails: state.fetchPoolDetails,
      calculateTokenBAmount: state.calculateTokenBAmount,
      calculateTokenAAmount: state.calculateTokenAAmount,
      addLiquidity: state.addLiquidity,
      removeLiquidity: state.removeLiquidity,
      resetForm: state.resetForm,
      setPairFromAddresses: state.setPairFromAddresses,
      calculateExpectedLpTokens: state.calculateExpectedLpTokens,
    }))
  );
