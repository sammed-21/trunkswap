import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { ethers, JsonRpcProvider } from "ethers";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { useSwapStore } from "./swapStore";

import { poolData } from "@/services/pool/getPoolDetailsFunction";

// correct the path if needed
// <-- Direct call outside React component

// Types for pool data
interface PoolPosition {
  pairAddress: string;
  token0: string;
  token1: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidity: string;
  token0Amount: string;
  token1Amount: string;
}

export type PoolDetails = {
  pairAddress: string; // EVM address
  token0: {
    address: string;
    symbol: string;
  };
  token1: {
    address: string;
    symbol: string;
  };
  reserve0: any;
  reserve1: any;
  reserves: readonly [bigint, bigint, bigint]; // reserve0, reserve1, blockTimestampLast
  totalSupply: bigint;
  tvl: number;
};

interface PoolState {
  // State
  userPositions: PoolPosition[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  poolData: PoolDetails[];
  totalPool: number | string;
  totalTvl: number;

  // Actions
  setUserPositions: (positions: PoolPosition[]) => void;
  addUserPosition: (position: PoolPosition) => void;
  removeUserPosition: (pairAddress: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPoolStore: () => void;
  fetchUserPositions: (
    provider: ethers.Provider,
    account: string,
    factoryAddress: string
  ) => Promise<PoolPosition[] | undefined>;
  fetchPoolData: (
    provider: ethers.Provider,
    factoryAddress: string
  ) => Promise<void>;
}

// Default state
const defaultPoolState = {
  userPositions: [],
  poolData: [],
  isLoading: true,
  error: null,
  lastUpdated: 0,
  totalPool: 0,
  totalTvl: 0,
};

export const usePoolStore = create<PoolState>((set, get) => ({
  ...defaultPoolState,

  setUserPositions: (positions) =>
    set({ userPositions: positions, lastUpdated: Date.now() }),

  addUserPosition: (position) =>
    set((state) => ({
      userPositions: [
        ...state.userPositions.filter(
          (p) => p.pairAddress !== position.pairAddress
        ),
        position,
      ],
      lastUpdated: Date.now(),
    })),

  removeUserPosition: (pairAddress) =>
    set((state) => ({
      userPositions: state.userPositions.filter(
        (p) => p.pairAddress !== pairAddress
      ),
      lastUpdated: Date.now(),
    })),

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error) => set({ error }),

  clearPoolStore: () => set(defaultPoolState),

  fetchPoolData: async (provider: ethers.Provider, factoryAddress: string) => {
    set({ isLoading: true, error: null });

    // Check for provider
    if (!provider) {
      set({ isLoading: false }); // Important: reset loading if no provider
      return;
    }
    try {
      // Start loading

      // Create contract and fetch data
      const factoryContract = new ethers.Contract(
        factoryAddress,
        FACTORY_ABI,
        provider
      );

      const totalPool = await factoryContract.allPairsLength();
      const poolDetails = await poolData(factoryContract, provider);

      // Update state with results
      set({
        poolData: poolDetails,
        totalPool: totalPool.toString(),
      });
    } catch (error: any) {
      console.log(error);
      // Important: Reset loading state in case of error
      set({
        isLoading: false,
        error: error.message || "Failed to fetch pool data",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchUserPositions: async (
    provider: ethers.Provider | JsonRpcProvider | undefined,
    account: string,
    factoryAddress: string
  ) => {
    let prices = useSwapStore.getState().prices;
    if (!provider || !account || !factoryAddress || !prices) {
      set({ error: "Missing required parameters", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      // Create factory contract instance

      const factoryContract = new ethers.Contract(
        factoryAddress,
        FACTORY_ABI,
        provider
      );
      // Get the total number of pairs
      const pairsLength = await factoryContract.allPairsLength();

      // For demonstration, we'll limit to the first 100 pairs to prevent excessive requests
      const pairsToCheck = Math.min(6, parseInt(pairsLength.toString()));

      const positions: PoolPosition[] = [];

      // Check each pair
      for (let i = 0; i < pairsToCheck; i++) {
        try {
          // Get pair address
          const pairAddress = await factoryContract.allPairs(i);

          // Create pair contract instance
          const pairContract = new ethers.Contract(
            pairAddress,
            PAIR_ABI,
            provider
          );

          // Check if user has LP tokens
          const userLPBalance = await pairContract.balanceOf(account);

          // If user has no LP tokens, skip this pair
          if (userLPBalance == 0) continue;

          // Get pair tokens
          const token0Address = await pairContract.token0();
          const token1Address = await pairContract.token1();

          // Create token contracts
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

          // Get token symbols and decimals
          const [
            token0Symbol,
            token1Symbol,
            token0Decimals,
            token1Decimals,
            reserves,
            totalSupply,
          ] = await Promise.all([
            token0Contract.symbol(),
            token1Contract.symbol(),
            token0Contract.decimals(),
            token1Contract.decimals(),
            pairContract.getReserves(),
            pairContract.totalSupply(),
          ]);

          // Calculate user's share of the pool
          const userShare = (userLPBalance * ethers.WeiPerEther) / totalSupply;

          // Calculate token amounts based on user's share
          const token0Amount = (reserves[0] * userShare) / ethers.WeiPerEther;
          const token1Amount = (reserves[1] * userShare) / ethers.WeiPerEther;

          // Format token amounts with proper decimals
          const formattedToken0Amount = ethers.formatUnits(
            token0Amount,
            token0Decimals
          );
          const formattedToken1Amount = ethers.formatUnits(
            token1Amount,
            token1Decimals
          );
          // Add position to the list

          positions.push({
            pairAddress,
            token0: token0Address,
            token1: token1Address,
            token0Symbol,
            token1Symbol,
            liquidity: ethers.formatEther(userLPBalance),
            token0Amount: formattedToken0Amount,
            token1Amount: formattedToken1Amount,
          });
        } catch (error) {
          console.error(`Error fetching data for pair ${i}:`, error);
          // Continue with next pair instead of failing the entire process
        }
      }
      set({
        userPositions: positions,
        isLoading: false,
        lastUpdated: Date.now(),
      });
      return positions;
    } catch (error) {
      console.error("Error fetching user positions:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch positions",
        isLoading: false,
      });
    }
  },
}));

// Selector for State Only
export const usePoolState = () =>
  usePoolStore(
    useShallow((state: PoolState) => ({
      userPositions: state.userPositions,
      isLoading: state.isLoading,
      error: state.error,
      lastUpdated: state.lastUpdated,
      poolData: state.poolData,
      totalPool: state.totalPool,
    }))
  );

// Selector for Actions Only
export const usePoolActions = () =>
  usePoolStore(
    useShallow((state: PoolState) => ({
      setUserPositions: state.setUserPositions,
      addUserPosition: state.addUserPosition,
      removeUserPosition: state.removeUserPosition,
      setLoading: state.setLoading,
      setError: state.setError,
      clearPoolStore: state.clearPoolStore,
      fetchUserPositions: state.fetchUserPositions,
      fetchPoolData: state.fetchPoolData,
    }))
  );
