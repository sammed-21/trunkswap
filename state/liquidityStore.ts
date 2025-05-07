// lib/stores/useLiquidityStore.ts
import { create } from "zustand";
import { TokenDetail, Prices } from "@/lib/types";
import { fetchTokenBalance } from "@/services/getTokenBalance";
import { formatDigits } from "@/lib/utils";
import { getUSDValue, getUSDValueSync } from "@/services/priceFeed";

import { ethers } from "ethers";
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";

// Import necessary ABIs

// Prepare types for liquidity store
interface LiquidityState {
  // Pool list states
  pools: PoolInfo[];
  isLoadingPools: boolean;
  selectedPool: PoolInfo | null;

  // Add liquidity states
  tokenAAmount: string;
  tokenBAmount: string;
  tokenABalance: string;
  tokenBBalance: string;
  tokenAUsdValue: number | null;
  tokenBUsdValue: number | null;
  loadingBalances: boolean;

  // Transaction states
  isAddingLiquidity: boolean;
  isRemovingLiquidity: boolean;
  liquidityBalance: string;
  liquidityTokenDecimals: number;
  removeLiquidityAmount: string;
  removeLiquidityPercent: number;
  expectedTokenAOutput: string;
  expectedTokenBOutput: string;
  slippage: number;
  deadline: number;
  needsApprovalTokenA: boolean;
  needsApprovalTokenB: boolean;
  isApprovingTokenA: boolean;
  isApprovingTokenB: boolean;
  transactionButtonText: string;

  // Error states
  error: string | null;
}

interface LiquidityActions {
  // Pool actions
  fetchPools: () => Promise<void>;
  selectPool: (pool: PoolInfo) => void;
  calculateTokenAAmountFromPrice: () => void;
  calculateTokenBAmountFromPrice: () => void;
  // Balance/Amount actions
  setTokenAAmount: (amount: string) => void;
  setTokenBAmount: (amount: string) => void;
  fetchTokenBalances: (walletAddress: string, provider: any) => Promise<void>;
  fetchLiquidityBalance: (
    walletAddress: string,
    provider: any
  ) => Promise<void>;

  // Transaction actions
  setSlippage: (slippage: number) => void;
  setDeadline: (deadline: number) => void;
  setRemoveLiquidityPercent: (percent: number) => void;
  checkAllowance: (walletAddress: string, provider: any) => Promise<void>;
  approveTokenA: (walletAddress: string, provider: any) => Promise<void>;
  approveTokenB: (walletAddress: string, provider: any) => Promise<void>;
  addLiquidity: (walletAddress: string, provider: any) => Promise<void>;
  removeLiquidity: (walletAddress: string, provider: any) => Promise<void>;

  // Helper actions
  calculateTokenBAmount: () => void;
  calculateTokenAAmount: () => void;
  calculateRemoveLiquidityOutputs: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

export interface PoolInfo {
  pairAddress: string;
  tokenA: TokenDetail;
  tokenB: TokenDetail;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  apr: number | null;
  volume24h: string | null;
  tvl: number | null;
}

const ROUTER_ADDRESS = "0x..."; // Your router address

const useLiquidityStore = create<LiquidityState & LiquidityActions>(
  (set, get) => ({
    // Initial state
    pools: [],
    isLoadingPools: false,
    selectedPool: null,
    tokenAAmount: "",
    tokenBAmount: "",
    tokenABalance: "0",
    tokenBBalance: "0",
    tokenAUsdValue: null,
    tokenBUsdValue: null,
    loadingBalances: false,
    isAddingLiquidity: false,
    isRemovingLiquidity: false,
    liquidityBalance: "0",
    liquidityTokenDecimals: 18,
    removeLiquidityAmount: "",
    removeLiquidityPercent: 0,
    expectedTokenAOutput: "0",
    expectedTokenBOutput: "0",
    slippage: 0.5,
    deadline: 20,
    needsApprovalTokenA: true,
    needsApprovalTokenB: true,
    isApprovingTokenA: false,
    isApprovingTokenB: false,
    transactionButtonText: "Add Liquidity",
    error: null,

    // Actions
    fetchPools: async () => {
      try {
        set({ isLoadingPools: true, error: null });

        // Here you would fetch pool data from your backend or blockchain
        // This is a mock example - replace with actual API call
        const response = await fetch("/api/pools");
        const pools = await response.json();

        set({ pools, isLoadingPools: false });
      } catch (error) {
        console.error("Error fetching pools:", error);
        set({
          isLoadingPools: false,
          error: "Failed to fetch pools. Please try again.",
        });
      }
    },

    selectPool: (pool) => {
      set({
        selectedPool: pool,
        tokenAAmount: "",
        tokenBAmount: "",
        tokenAUsdValue: null,
        tokenBUsdValue: null,
        error: null,
      });
    },

    setTokenAAmount: (amount) => {
      const state = get();
      const pool = state.selectedPool;

      if (!pool) return;

      // Get the USD value for display
      const token = pool.tokenA.symbol;
      const usdValue = amount ? getUSDValueSync(amount, token) : null;

      set({
        tokenAAmount: formatDigits(amount),
        tokenAUsdValue: usdValue,
      });

      // Calculate corresponding tokenB amount based on reserves
      if (amount && amount !== "0") {
        get().calculateTokenBAmount();
      } else {
        set({ tokenBAmount: "", tokenBUsdValue: null });
      }
    },

    setTokenBAmount: (amount) => {
      const state = get();
      const pool = state.selectedPool;

      if (!pool) return;

      // Get the USD value for display
      const token = pool.tokenB.symbol;
      const usdValue = amount ? getUSDValueSync(amount, token) : null;

      set({
        tokenBAmount: formatDigits(amount),
        tokenBUsdValue: usdValue,
      });

      // Calculate corresponding tokenA amount based on reserves
      if (amount && amount !== "0") {
        get().calculateTokenAAmount();
      } else {
        set({ tokenAAmount: "", tokenAUsdValue: null });
      }
    },

    calculateTokenBAmount: () => {
      const { selectedPool, tokenAAmount } = get();

      if (!selectedPool || !tokenAAmount) return;

      try {
        // Get reserves - assume reserve0 corresponds to tokenA and reserve1 to tokenB
        // In real implementation, you need to check token ordering in the pair
        const { reserve0, reserve1 } = selectedPool;

        if (!reserve0 || !reserve1 || reserve0 === "0" || reserve1 === "0") {
          // If no reserves (new pool), use price ratio
          get().calculateTokenBAmountFromPrice();
          return;
        }

        const reserve0BN = ethers.parseUnits(
          reserve0,
          selectedPool.tokenA.decimals
        );
        const reserve1BN = ethers.parseUnits(
          reserve1,
          selectedPool.tokenB.decimals
        );
        const amountABN = ethers.parseUnits(
          tokenAAmount,
          selectedPool.tokenA.decimals
        );

        // Calculate based on constant product formula: amountB = amountA * reserve1 / reserve0
        const amountBBN = (amountABN * reserve1BN) / reserve0BN;
        const amountB = ethers.formatUnits(
          amountBBN,
          selectedPool.tokenB.decimals
        );

        const token = selectedPool.tokenB.symbol;
        const usdValue = getUSDValueSync(amountB, token);

        set({
          tokenBAmount: formatDigits(amountB),
          tokenBUsdValue: usdValue,
        });
      } catch (error) {
        console.error("Error calculating token B amount:", error);
        set({ error: "Failed to calculate equivalent amount" });
      }
    },

    calculateTokenBAmountFromPrice: () => {
      const { selectedPool, tokenAAmount } = get();

      if (!selectedPool || !tokenAAmount) return;

      try {
        // Use price ratio if available
        const tokenAPrice = getUSDValueSync("1", selectedPool.tokenA.symbol);
        const tokenBPrice = getUSDValueSync("1", selectedPool.tokenB.symbol);

        if (!tokenAPrice || !tokenBPrice) {
          set({ error: "Price data unavailable" });
          return;
        }

        // Calculate tokenB amount: tokenAAmount * (tokenAPrice / tokenBPrice)
        const amountB = (
          (parseFloat(tokenAAmount) * tokenAPrice) /
          tokenBPrice
        ).toString();

        const usdValue = getUSDValueSync(amountB, selectedPool.tokenB.symbol);

        set({
          tokenBAmount: formatDigits(amountB),
          tokenBUsdValue: usdValue,
        });
      } catch (error) {
        console.error("Error calculating token B amount from price:", error);
        set({ error: "Failed to calculate equivalent amount" });
      }
    },

    calculateTokenAAmount: () => {
      const { selectedPool, tokenBAmount, calculateTokenAAmountFromPrice } =
        get();

      if (!selectedPool || !tokenBAmount) return;

      try {
        // Get reserves - assume reserve0 corresponds to tokenA and reserve1 to tokenB
        const { reserve0, reserve1 } = selectedPool;

        if (!reserve0 || !reserve1 || reserve0 === "0" || reserve1 === "0") {
          // If no reserves (new pool), use price ratio
          calculateTokenAAmountFromPrice();
          return;
        }

        const reserve0BN = ethers.parseUnits(
          reserve0,
          selectedPool.tokenA.decimals
        );
        const reserve1BN = ethers.parseUnits(
          reserve1,
          selectedPool.tokenB.decimals
        );
        const amountBBN = ethers.parseUnits(
          tokenBAmount,
          selectedPool.tokenB.decimals
        );

        // Calculate based on constant product formula: amountA = amountB * reserve0 / reserve1
        const amountABN = (amountBBN * reserve0BN) / reserve1BN;
        const amountA = ethers.formatUnits(
          amountABN,
          selectedPool.tokenA.decimals
        );

        const token = selectedPool.tokenA.symbol;
        const usdValue = getUSDValueSync(amountA, token);

        set({
          tokenAAmount: formatDigits(amountA),
          tokenAUsdValue: usdValue,
        });
      } catch (error) {
        console.error("Error calculating token A amount:", error);
        set({ error: "Failed to calculate equivalent amount" });
      }
    },

    calculateTokenAAmountFromPrice: () => {
      const { selectedPool, tokenBAmount } = get();

      if (!selectedPool || !tokenBAmount) return;

      try {
        // Use price ratio if available
        const tokenAPrice = getUSDValueSync("1", selectedPool.tokenA.symbol);
        const tokenBPrice = getUSDValueSync("1", selectedPool.tokenB.symbol);

        if (!tokenAPrice || !tokenBPrice) {
          set({ error: "Price data unavailable" });
          return;
        }

        // Calculate tokenA amount: tokenBAmount * (tokenBPrice / tokenAPrice)
        const amountA = (
          (parseFloat(tokenBAmount) * tokenBPrice) /
          tokenAPrice
        ).toString();

        const usdValue = getUSDValueSync(amountA, selectedPool.tokenA.symbol);

        set({
          tokenAAmount: formatDigits(amountA),
          tokenAUsdValue: usdValue,
        });
      } catch (error) {
        console.error("Error calculating token A amount from price:", error);
        set({ error: "Failed to calculate equivalent amount" });
      }
    },

    fetchTokenBalances: async (walletAddress, provider) => {
      const { selectedPool } = get();

      if (!selectedPool || !walletAddress || !provider) return;

      try {
        set({ loadingBalances: true, error: null });

        // Fetch Token A balance
        const tokenABalance = await fetchTokenBalance(
          selectedPool.tokenA.address,
          walletAddress,
          provider,
          selectedPool.tokenA.decimals
        );

        // Fetch Token B balance
        const tokenBBalance = await fetchTokenBalance(
          selectedPool.tokenB.address,
          walletAddress,
          provider,
          selectedPool.tokenB.decimals
        );

        set({
          tokenABalance: tokenABalance,
          tokenBBalance: tokenBBalance,
          loadingBalances: false,
        });
      } catch (error) {
        console.error("Error fetching token balances:", error);
        set({
          loadingBalances: false,
          error: "Failed to fetch token balances",
        });
      }
    },

    fetchLiquidityBalance: async (walletAddress, provider) => {
      const { selectedPool } = get();

      if (!selectedPool || !walletAddress || !provider) return;

      try {
        // Get the pair contract
        const pairContract = new ethers.Contract(
          selectedPool.pairAddress,
          PAIR_ABI,
          provider
        );

        // Get LP token decimals
        const decimals = await pairContract.decimals();

        // Get user's LP token balance
        const balance = await pairContract.balanceOf(walletAddress);
        const formattedBalance = ethers.formatUnits(balance, decimals);

        set({
          liquidityBalance: formattedBalance,
          liquidityTokenDecimals: decimals,
        });
      } catch (error) {
        console.error("Error fetching liquidity balance:", error);
        set({ error: "Failed to fetch liquidity balance" });
      }
    },

    setSlippage: (slippage) => set({ slippage }),

    setDeadline: (deadline) => set({ deadline }),

    setRemoveLiquidityPercent: (percent) => {
      const { liquidityBalance, liquidityTokenDecimals } = get();

      if (!liquidityBalance || liquidityBalance === "0") return;

      try {
        // Calculate the amount based on percentage
        const amount = (
          (parseFloat(liquidityBalance) * percent) /
          100
        ).toString();
        set({
          removeLiquidityPercent: percent,
          removeLiquidityAmount: formatDigits(amount),
        });

        // Calculate expected output
        get().calculateRemoveLiquidityOutputs();
      } catch (error) {
        console.error("Error setting remove liquidity percent:", error);
      }
    },

    calculateRemoveLiquidityOutputs: () => {
      const { selectedPool, removeLiquidityAmount, liquidityBalance } = get();

      if (
        !selectedPool ||
        !removeLiquidityAmount ||
        !liquidityBalance ||
        liquidityBalance === "0"
      )
        return;

      try {
        // Calculate the percentage of total liquidity to remove
        const percent =
          parseFloat(removeLiquidityAmount) / parseFloat(liquidityBalance);

        // Estimate token returns based on reserves
        const tokenAAmount = (
          parseFloat(selectedPool.reserve0) * percent
        ).toString();
        const tokenBAmount = (
          parseFloat(selectedPool.reserve1) * percent
        ).toString();

        set({
          expectedTokenAOutput: formatDigits(tokenAAmount),
          expectedTokenBOutput: formatDigits(tokenBAmount),
        });
      } catch (error) {
        console.error("Error calculating remove liquidity outputs:", error);
      }
    },

    checkAllowance: async (walletAddress, provider) => {
      const { selectedPool } = get();

      if (!selectedPool || !walletAddress || !provider) return;

      try {
        set({ error: null });

        // Get the token contracts
        const tokenAContract = new ethers.Contract(
          selectedPool.tokenA.address,
          ERC20_ABI,
          provider
        );

        const tokenBContract = new ethers.Contract(
          selectedPool.tokenB.address,
          ERC20_ABI,
          provider
        );

        // Check allowance for tokenA
        const allowanceA = await tokenAContract.allowance(
          walletAddress,
          ROUTER_ADDRESS
        );
        const needsApprovalA = allowanceA.lt(
          ethers.parseUnits(
            get().tokenAAmount || "0",
            selectedPool.tokenA.decimals
          )
        );

        // Check allowance for tokenB
        const allowanceB = await tokenBContract.allowance(
          walletAddress,
          ROUTER_ADDRESS
        );
        const needsApprovalB = allowanceB.lt(
          ethers.parseUnits(
            get().tokenBAmount || "0",
            selectedPool.tokenB.decimals
          )
        );

        set({
          needsApprovalTokenA: needsApprovalA,
          needsApprovalTokenB: needsApprovalB,
        });
      } catch (error) {
        console.error("Error checking allowance:", error);
        set({ error: "Failed to check token allowances" });
      }
    },

    approveTokenA: async (walletAddress, provider) => {
      const { selectedPool } = get();

      if (!selectedPool || !walletAddress) return;

      try {
        set({ isApprovingTokenA: true, error: null });

        const signer = provider.getSigner(walletAddress);
        const tokenContract = new ethers.Contract(
          selectedPool.tokenA.address,
          ERC20_ABI,
          signer
        );

        // Approve max uint256
        const tx = await tokenContract.approve(
          ROUTER_ADDRESS,
          ethers.MaxUint256
        );

        await tx.wait();

        set({
          isApprovingTokenA: false,
          needsApprovalTokenA: false,
        });

        // toastSuccess(`${selectedPool.tokenA.symbol} approved successfully`);
      } catch (error) {
        console.error("Error approving token A:", error);
        set({
          isApprovingTokenA: false,
          error: `Failed to approve ${selectedPool.tokenA.symbol}`,
        });
        // toastError(`Failed to approve ${selectedPool.tokenA.symbol}`);
      }
    },

    approveTokenB: async (walletAddress, provider) => {
      const { selectedPool } = get();

      if (!selectedPool || !walletAddress) return;

      try {
        set({ isApprovingTokenB: true, error: null });

        const signer = provider.getSigner(walletAddress);
        const tokenContract = new ethers.Contract(
          selectedPool.tokenB.address,
          ERC20_ABI,
          signer
        );

        // Approve max uint256
        const tx = await tokenContract.approve(
          ROUTER_ADDRESS,
          ethers.MaxUint256
        );

        await tx.wait();

        set({
          isApprovingTokenB: false,
          needsApprovalTokenB: false,
        });

        // toastSuccess(`${selectedPool.tokenB.symbol} approved successfully`);
      } catch (error) {
        console.error("Error approving token B:", error);
        set({
          isApprovingTokenB: false,
          error: `Failed to approve ${selectedPool.tokenB.symbol}`,
        });
        // toastError(`Failed to approve ${selectedPool.tokenB.symbol}`);
      }
    },

    addLiquidity: async (walletAddress, provider) => {
      const { selectedPool, tokenAAmount, tokenBAmount, slippage, deadline } =
        get();

      if (!selectedPool || !walletAddress || !tokenAAmount || !tokenBAmount)
        return;

      try {
        set({ isAddingLiquidity: true, error: null });

        const signer = provider.getSigner(walletAddress);
        const routerContract = new ethers.Contract(
          ROUTER_ADDRESS,
          ROUTER_ABI,
          signer
        );

        // Calculate minimum amounts based on slippage
        const amountADesired = ethers.parseUnits(
          tokenAAmount,
          selectedPool.tokenA.decimals
        );
        const amountBDesired = ethers.parseUnits(
          tokenBAmount,
          selectedPool.tokenB.decimals
        );

        //   const amountAMin = amountADesired * (Math.floor((100 - slippage) * 100)) / (10000);
        //   const amountBMin = amountBDesired * (Math.floor((100 - slippage) * 100)) /(10000);

        const slippagePercent = BigInt(Math.floor((100 - slippage) * 100)); // Convert result to bigint

        const amountAMin = (amountADesired * slippagePercent) / BigInt(10000);
        const amountBMin = (amountBDesired * slippagePercent) / BigInt(10000);

        // Calculate deadline timestamp
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

        // Execute transaction
        const tx = await routerContract.addLiquidity(
          selectedPool.tokenA.address,
          selectedPool.tokenB.address,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          walletAddress,
          deadlineTimestamp
        );

        await tx.wait();

        set({ isAddingLiquidity: false });
        // toastSuccess("Liquidity added successfully");

        // Refresh balances
        await get().fetchTokenBalances(walletAddress, provider);
        await get().fetchLiquidityBalance(walletAddress, provider);
      } catch (error) {
        console.error("Error adding liquidity:", error);
        set({
          isAddingLiquidity: false,
          error: "Failed to add liquidity",
        });
        // toastError("Failed to add liquidity");
      }
    },

    removeLiquidity: async (walletAddress, provider) => {
      const { selectedPool, removeLiquidityAmount, slippage, deadline } = get();

      if (!selectedPool || !walletAddress || !removeLiquidityAmount) return;

      try {
        set({ isRemovingLiquidity: true, error: null });

        const signer = provider.getSigner(walletAddress);
        const routerContract = new ethers.Contract(
          ROUTER_ADDRESS,
          ROUTER_ABI,
          signer
        );

        // Calculate liquidity amount
        const liquidityAmount = ethers.parseUnits(
          removeLiquidityAmount,
          get().liquidityTokenDecimals
        );

        // Calculate minimum amounts based on slippage
        const expectedA = ethers.parseUnits(
          get().expectedTokenAOutput,
          selectedPool.tokenA.decimals
        );

        const expectedB = ethers.parseUnits(
          get().expectedTokenBOutput,
          selectedPool.tokenB.decimals
        );

        //   const amountAMin = (expectedA * (Math.floor((100 - slippage) * 100)) / (10000));
        //   const amountBMin = (expectedB * (Math.floor((100 - slippage) * 100)) / (10000));
        const slippagePercent = BigInt(100 - slippage); // Convert to bigint
        const amountAMin =
          (expectedA * slippagePercent * BigInt(100)) / BigInt(10000);
        const amountBMin =
          (expectedB * slippagePercent * BigInt(100)) / BigInt(10000);

        // Calculate deadline timestamp
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

        // Check if pair token is approved
        const pairContract = new ethers.Contract(
          selectedPool.pairAddress,
          PAIR_ABI,
          signer
        );

        const allowance = await pairContract.allowance(
          walletAddress,
          ROUTER_ADDRESS
        );

        if (allowance.lt(liquidityAmount)) {
          // Approve router to spend LP tokens
          const approveTx = await pairContract.approve(
            ROUTER_ADDRESS,
            ethers.MaxUint256
          );
          await approveTx.wait();
        }

        // Execute transaction
        const tx = await routerContract.removeLiquidity(
          selectedPool.tokenA.address,
          selectedPool.tokenB.address,
          liquidityAmount,
          amountAMin,
          amountBMin,
          walletAddress,
          deadlineTimestamp
        );

        await tx.wait();

        set({ isRemovingLiquidity: false });
        // toastSuccess("Liquidity removed successfully");

        // Refresh balances
        await get().fetchTokenBalances(walletAddress, provider);
        await get().fetchLiquidityBalance(walletAddress, provider);
      } catch (error) {
        console.error("Error removing liquidity:", error);
        set({
          isRemovingLiquidity: false,
          error: "Failed to remove liquidity",
        });
        // toastError("Failed to remove liquidity");
      }
    },

    reset: () =>
      set({
        tokenAAmount: "",
        tokenBAmount: "",
        tokenAUsdValue: null,
        tokenBUsdValue: null,
        error: null,
        removeLiquidityAmount: "",
        removeLiquidityPercent: 0,
        expectedTokenAOutput: "0",
        expectedTokenBOutput: "0",
        transactionButtonText: "Add Liquidity",
      }),

    setError: (error) => set({ error }),
  })
);

export default useLiquidityStore;
