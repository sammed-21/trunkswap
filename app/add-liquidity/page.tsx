"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useAccountState } from "@/state/accountStore";
import TokenInput from "@/components/Pool/TokenInput";
import { Skeleton } from "@/components/ui/skeleton";
import { usePriceState, usePriceStore } from "@/state/priceStore";
import { useLiqudityState, useLiquidityActions } from "@/state/liquidityStore";
// import { useLiquidityStore } from '@/stores/liquidityStore';
// import { useWalletStore } from '@/stores/walletStore';
// import { useTokenStore } from '@/stores/tokenStore';
// import ErrorBoundary from '@/components/common/ErrorBoundary';
// import LoadingSpinner from '@/components/common/LoadingSpinner';
// import TokenInput from '@/components/liquidity/TokenInput';
// import { formatPercent } from '@/utils/formatting';

interface AddLiquidityPageProps {
  params: {
    tokenA: string;
    tokenB: string;
  };
}

export default function AddLiquidityPage({ params }: AddLiquidityPageProps) {
  const router = useRouter();
  const { tokenA: tokenAAddress, tokenB: tokenBAddress } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expectedLPTokens, setExpectedLPTokens] = useState("0");
  const [poolShare, setPoolShare] = useState(0);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5); // Default 0.5%
  const [deadline, setDeadline] = useState(20); // Default 20 minutes

  // Get data from stores
  const { isConnected, address } = useAccount();
  const { provider, signer } = useAccountState();
  //   const { tokenList, prices } = useTokenStore();
  const { prices } = usePriceState();
  const {
    selectedTokenA,
    selectedTokenB,
    selectedPool,
    tokenAAmount,
    tokenBAmount,

    isAddingLiquidity,
  } = useLiqudityState();

  const {
    resetForm,
    setPairFromAddresses,
    setTokenAAmount,
    setTokenBAmount,
    calculateTokenBAmount,
    calculateTokenAAmount,
    calculateExpectedLpTokens,
    addLiquidity,
  } = useLiquidityActions();

  // Load token pair on component mount
  useEffect(() => {
    const loadTokenPair = async () => {
      try {
        if (!provider || !isConnected) {
          setError("Please connect your wallet");
          setIsLoading(false);
          return;
        }

        await setPairFromAddresses(provider, tokenAAddress, tokenBAddress);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load token pair:", err);
        setError("Failed to load token pair. Please try again.");
        setIsLoading(false);
      }
    };

    loadTokenPair();

    // Cleanup on unmount
    return () => {
      resetForm();
    };
  }, [
    provider,
    isConnected,
    tokenAAddress,
    tokenBAddress,
    setPairFromAddresses,
    resetForm,
  ]);

  // Calculate expected LP tokens and pool share whenever input amounts change
  useEffect(() => {
    const updateLpInfo = async () => {
      if (!selectedPool || !tokenAAmount || !tokenBAmount || !provider) return;

      try {
        const lpTokens = await calculateExpectedLpTokens(provider);
        setExpectedLPTokens(lpTokens);

        // Calculate pool share based on LP tokens
        if (selectedPool.totalSupply && ethers.parseEther(lpTokens) > 0) {
          const lpTokensBigInt = ethers.parseEther(lpTokens); // bigint
          const totalSupplyBigInt = ethers.parseEther(selectedPool.totalSupply); // ensure it's also bigint

          const newShareBigInt =
            (Number(lpTokensBigInt) * 10000) /
            Number(totalSupplyBigInt + lpTokensBigInt);

          // Convert to decimal (e.g., 12.34)
          const newShare = Number(newShareBigInt) / 100;

          setPoolShare(newShare);
        } else {
          setPoolShare(100); // First liquidity provider gets 100%
        }
      } catch (err) {
        console.error("Error calculating LP tokens:", err);
      }
    };

    updateLpInfo();
  }, [
    tokenAAmount,
    tokenBAmount,
    selectedPool,
    provider,
    calculateExpectedLpTokens,
  ]);

  const handleTokenAInput = async (amount: string) => {
    setTokenAAmount(amount);
    if (amount && parseFloat(amount) > 0 && selectedPool) {
      const tokenBValue = await calculateTokenBAmount(provider!, amount);
      setTokenBAmount(amount);
    } else {
      setTokenBAmount("");
    }
  };

  const handleTokenBInput = async (amount: string) => {
    setTokenBAmount(amount);
    if (amount && parseFloat(amount) > 0 && selectedPool) {
      const tokenAValue = await calculateTokenAAmount(provider!, amount);
      setTokenAAmount(tokenAValue!);
    } else {
      setTokenAAmount("");
    }
  };

  const handleAddLiquidity = async () => {
    if (!isConnected || !provider || !address) {
      setError("Please connect your wallet");
      return;
    }

    if (
      !tokenAAmount ||
      !tokenBAmount ||
      parseFloat(tokenAAmount) <= 0 ||
      parseFloat(tokenBAmount) <= 0
    ) {
      setError("Please enter valid amounts");
      return;
    }

    try {
      // Calculate deadline timestamp (current time + deadline minutes)
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadline * 60;

      await addLiquidity(signer);

      // Clear inputs and redirect to pool details
      resetForm();
      router.push(`/pool/${selectedPool?.pairAddress}`);
    } catch (err: any) {
      console.error("Failed to add liquidity:", err);
      setError(err.message || "Failed to add liquidity. Please try again.");
    }
  };

  // Check if inputs are valid for adding liquidity
  const isValidInput =
    tokenAAmount &&
    tokenBAmount &&
    parseFloat(tokenAAmount) > 0 &&
    parseFloat(tokenBAmount) > 0 &&
    !isAddingLiquidity;

  // Calculate USD values if prices are available
  const getTokenAUsdValue = () => {
    if (!selectedTokenA || !tokenAAmount || !prices) return null;
    const priceKey = `${selectedTokenA.symbol}_USD`;
    const price = prices[priceKey];
    if (!price) return null;

    return parseFloat(tokenAAmount) * price;
  };

  const getTokenBUsdValue = () => {
    if (!selectedTokenB || !tokenBAmount || !prices) return null;
    const priceKey = `${selectedTokenB.symbol}_USD`;
    const price = prices[priceKey];
    if (!price) return null;

    return parseFloat(tokenBAmount) * price;
  };

  const tokenAUsdValue = getTokenAUsdValue();
  const tokenBUsdValue = getTokenBUsdValue();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Skeleton className="h-10 w-40 bg-subtitle" />
      </div>
    );
  }

  if (error && !selectedTokenA && !selectedTokenB) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
          Error
        </h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <Link
          href="/pool"
          className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to Pools
        </Link>
      </div>
    );
  }

  return (
    // <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
    <div className="w-full mx-auto max-w-[1440px] mt-8 p-6 bg-forground rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add Liquidity
        </h1>
        <Link
          href="/pool"
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to Pools
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Token A Input */}
        <TokenInput
          label="Token A"
          token={selectedTokenA}
          value={tokenAAmount}
          onChange={handleTokenAInput}
          usdValue={tokenAUsdValue}
          disabled={isAddingLiquidity}
        />

        {/* Plus icon between inputs */}
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>

        {/* Token B Input */}
        <TokenInput
          label="Token B"
          token={selectedTokenB}
          value={tokenBAmount}
          onChange={handleTokenBInput}
          usdValue={tokenBUsdValue}
          disabled={isAddingLiquidity}
        />

        {/* Settings */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
            Settings
          </h3>

          <div className="flex justify-between items-center mb-3">
            <label
              htmlFor="slippage"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Slippage Tolerance
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSlippageTolerance(0.1)}
                className={`px-2 py-1 text-xs rounded ${
                  slippageTolerance === 0.1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                0.1%
              </button>
              <button
                onClick={() => setSlippageTolerance(0.5)}
                className={`px-2 py-1 text-xs rounded ${
                  slippageTolerance === 0.5
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                0.5%
              </button>
              <button
                onClick={() => setSlippageTolerance(1.0)}
                className={`px-2 py-1 text-xs rounded ${
                  slippageTolerance === 1.0
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                1.0%
              </button>
              <input
                type="number"
                id="custom-slippage"
                value={slippageTolerance}
                onChange={(e) =>
                  setSlippageTolerance(parseFloat(e.target.value) || 0)
                }
                className="w-16 text-right bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                min="0.1"
                max="10"
                step="0.1"
              />
              <span className="text-gray-600 dark:text-gray-300">%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <label
              htmlFor="deadline"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Transaction Deadline
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(parseInt(e.target.value) || 10)}
                className="w-16 text-right bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                min="1"
                max="180"
              />
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                minutes
              </span>
            </div>
          </div>
        </div>

        {/* Pool information */}
        {selectedPool && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
              Pool Information
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Pool Address
                </span>
                <span className="text-gray-800 dark:text-gray-100 font-mono">
                  {selectedPool.pairAddress.slice(0, 6)}...
                  {selectedPool.pairAddress.slice(-4)}
                </span>
              </div>

              {selectedPool.totalSupply && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Total Liquidity
                  </span>
                  <span className="text-gray-800 dark:text-gray-100">
                    {ethers.formatEther(selectedPool.totalSupply)} LP
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Expected LP Tokens
                </span>
                <span className="text-gray-800 dark:text-gray-100">
                  {expectedLPTokens}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Pool Share
                </span>
                <span className="text-gray-800 dark:text-gray-100">
                  {poolShare}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAddLiquidity}
          disabled={!isValidInput || isAddingLiquidity}
          className={`w-full mt-6 py-3 px-4 rounded-lg font-medium ${
            isValidInput && !isAddingLiquidity
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {isAddingLiquidity ? (
            <div className="flex items-center justify-center">
              <Skeleton className="h-10 w-40 bg-subtitle" />
              <span className="ml-2">Adding Liquidity...</span>
            </div>
          ) : !isConnected ? (
            "Connect Wallet"
          ) : !tokenAAmount || !tokenBAmount ? (
            "Enter an Amount"
          ) : (
            "Add Liquidity"
          )}
        </button>
      </div>
    </div>
    // </ErrorBoundary>
  );
}
