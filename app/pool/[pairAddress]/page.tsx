"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";

// import { formatCurrency, formatPercent } from '@/utils/formatting';
// import ErrorBoundary from '@/components/common/ErrorBoundary';
// import LoadingSpinner from '@/components/common/LoadingSpinner';
// import PoolChart from '@/components/liquidity/PoolChart';
// import LiquidityStats from '@/components/liquidity/LiquidityStats';
import {
  Pool,
  useLiqudityState,
  useLiquidityActions,
} from "@/state/liquidityStore";
import { useAccount, useChainId } from "wagmi";
import { useAccountState } from "@/state/accountStore";
import { Skeleton } from "@/components/ui/skeleton";
import { FormatUsd } from "@/components/Common/FormatUsd";
import { formatUSD } from "@/services/priceFeed";
import { formatPercentage, shortenAddress } from "@/lib/utils";
import { TradingViewWidget } from "@/components/Chart/TradingViewWidget";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ConnectWallet from "@/components/Common/ConnectWallet";
import { Button } from "@/components/ui/Button";
import { getProvider } from "@/services/getProvider";

interface PoolDetailPageProps {
  params: {
    pairAddress: string;
  };
}

export default function PoolDetailPage({ params }: PoolDetailPageProps) {
  const router = useRouter();
  const { pairAddress } = params;
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [percentToRemove, setPercentToRemove] = useState(0);
  const [pool, setPool] = useState<Pool | null>(null);
  const [removingLiquidity, setRemovingLiquidity] = useState(false);

  // Get data from stores
  const { isConnected, address } = useAccount();
  const { provider, signer } = useAccountState();
  const { fetchPoolDetails, setSelectedPool, removeLiquidity } =
    useLiquidityActions();
  const { selectedPool, isRemovingLiquidity } = useLiqudityState();

  // Fetch pool details when component mounts
  useEffect(() => {
    const loadPoolDetails = async () => {
      if (!provider) {
        setError("Something went wrong");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);

        // If we already have selected pool and it matches the pairAddress, use it
        if (
          selectedPool &&
          selectedPool.pairAddress.toLowerCase() === pairAddress.toLowerCase()
        ) {
          setPool(selectedPool);
        } else {
          // Otherwise fetch the pool details
          const poolDetails = await fetchPoolDetails(
            provider,
            pairAddress,
            chainId
          );
          if (poolDetails) {
            setPool(poolDetails);
            setSelectedPool(poolDetails);
          } else {
            setError("Pool not found");
          }
        }
      } catch (err) {
        console.error("Error loading pool details:", err);
        setError("Failed to load pool details");
      } finally {
        setIsLoading(false);
      }
    };
    if (provider) {
      loadPoolDetails();
    } else {
      getProvider(chainId);
    }
  }, [
    pairAddress,
    provider,
    isConnected,
    fetchPoolDetails,
    selectedPool,
    setSelectedPool,
  ]);

  // Handle remove liquidity
  const handleRemoveLiquidity = async () => {
    if (!provider || !isConnected || !pool) return;

    try {
      setRemovingLiquidity(true);
      const txHash = await removeLiquidity(signer);

      if (txHash) {
        // Refresh pool details
        const updatedPool = await fetchPoolDetails(
          provider,
          pairAddress,
          chainId
        );
        if (updatedPool) {
          setPool(updatedPool);
          setSelectedPool(updatedPool);
        }
      }
    } catch (err) {
      console.error("Error removing liquidity:", err);
    } finally {
      setRemovingLiquidity(false);
      setPercentToRemove(0);
    }
  };

  // Calculate user's position value
  const getUserPositionValue = () => {
    if (!pool || parseFloat(pool.userLpBalance!) === 0) return 0;

    const userShare =
      parseFloat(pool.userLpBalance!) / parseFloat(pool.totalSupply);
    const poolValue =
      parseFloat(pool.reserves0) * parseFloat(pool.token0Price) * 2; // Total liquidity doubled because of both tokens

    return userShare * poolValue;
  };

  // Calculate expected return amounts for removal
  const getExpectedReturns = () =>
    useCallback(() => {
      let amount0, amount1;
      if (!pool || percentToRemove === 0 || pool.userLpBalance == undefined) {
        return { amount0: 0, amount1: 0 };
      }
      if (pool.userLpBalance) {
        const userShare =
          parseFloat(pool.userLpBalance) / parseFloat(pool.totalSupply);
        const removalShare = userShare * (percentToRemove / 100);

        amount0 = parseFloat(pool.reserves0) * removalShare;
        amount1 = parseFloat(pool.reserves1) * removalShare;
      }
      return { amount0, amount1 };
    }, [address]);

  const expectedReturns = getExpectedReturns();
  // Format address for display
  return (
    <div className="flex flex-col gap-4  mb-10 w-full mx-auto justify-center items-start ">
      <div className=" flex items-center  max-w-[1440px] py-6  w-full justify-start mx-auto  ">
        <Link
          href="/pool"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Pools
        </Link>
      </div>
      <div className=" flex gap-4 max-w-[1440px] justify-center w-full mx-auto">
        {/* Navigation */}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Skeleton className="h-10 w-40 bg-subtitle" />
          </div>
        )}

        {/* Pool details */}
        {!isLoading && pool && (
          <div className="space-b-6 flex flex-row gap-4 w-full">
            <div className="flex flex-col gap-4 w-full">
              {/* Header */}
              <div className="bg-forground rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{`${pool.token0.symbol}/${pool.token1.symbol}`}</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Pair address: {shortenAddress(pool.pairAddress)}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3">
                    <Link
                      href={`/add-liquidity/${pool.token0.address}/${pool.token1.address}`}
                    >
                      <Button variant={"primary"}>Add Liquidity</Button>
                    </Link>
                    <Link
                      href={`/swap?inputToken=${pool.token0.address}&outputToken=${pool.token1.address}`}
                    >
                      <Button variant={"secondary"}>Swap</Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-forground relative h-[500px] rounded-lg shadow-md p-6">
                {/* <h2 className="text-lg font-medium mb-4">Price History</h2> */}
                {/* <div className="h-64">
                <PoolChart pairAddress={pool.pairAddress} token0Symbol={pool.token0.symbol} token1Symbol={pool.token1.symbol} />
              </div> */}
                <TradingViewWidget />
              </div>

              {/* Pool statistics */}
              {
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-forground rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-medium mb-4">
                      Pool Statistics
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Liquidity:</span>
                        <span className="font-medium">
                          {FormatUsd(
                            parseFloat(pool.reserves0) *
                              parseFloat(pool.token0Price) +
                              parseFloat(pool.reserves1) *
                                parseFloat(pool.token1Price)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reserves:</span>
                        <div className="text-right">
                          <div>{`${parseFloat(pool.reserves0).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 6 }
                          )} ${pool.token0.symbol}`}</div>
                          <div>{`${parseFloat(pool.reserves1).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 6 }
                          )} ${pool.token1.symbol}`}</div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Current Pool Price:
                        </span>
                        <div className="text-right">
                          <div>{`1 ${pool.token0.symbol} = ${parseFloat(
                            pool.token1Price
                          ).toFixed(6)} ${pool.token1.symbol}`}</div>
                          <div>{`1 ${pool.token1.symbol} = ${parseFloat(
                            pool.token0Price
                          ).toFixed(6)} ${pool.token0.symbol}`}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {address && (
                    <>
                      <div className="bg-forground rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-medium mb-4">
                          Your Position
                        </h2>
                        {pool.userLpBalance &&
                        parseFloat(pool.userLpBalance) > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Your Share:</span>
                              <span className="font-medium">
                                {formatPercentage(
                                  pool.userLpBalance,
                                  pool.totalSupply
                                )}
                                {/* {parseFloat(pool.userLpBalance) /
                        parseFloat(pool.totalSupply)} */}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Position Value:
                              </span>
                              <span className="font-medium">
                                {formatUSD(getUserPositionValue())}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Your Tokens:
                              </span>
                              <div className="text-right">
                                <div>{`${(
                                  (parseFloat(pool.reserves0) *
                                    parseFloat(pool.userLpBalance)) /
                                  parseFloat(pool.totalSupply)
                                ).toFixed(6)} ${pool.token0.symbol}`}</div>
                                <div>{`${(
                                  (parseFloat(pool.reserves1) *
                                    parseFloat(pool.userLpBalance)) /
                                  parseFloat(pool.totalSupply)
                                ).toFixed(6)} ${pool.token1.symbol}`}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 mb-4">
                              You don't have a position in this pool yet.
                            </p>
                            <Link
                              href={`/add-liquidity/${pool.token0.address}/${pool.token1.address}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                            >
                              Add Liquidity
                            </Link>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              }

              {/* Price chart */}
            </div>
            {
              <div className="max-w-[500px] w-full flex flex-col ">
                {/* Remove liquidity section */}
                <div className="bg-forground rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-medium mb-4">Token Info</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          {pool.token0.symbol}:
                        </span>
                        <span className="font-mono">
                          {shortenAddress(pool.token0.address)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {pool.token0.name}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          {pool.token1.symbol}:
                        </span>
                        <span className="font-mono">
                          {shortenAddress(pool.token1.address)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {pool.token1.name}
                      </div>
                    </div>
                  </div>
                </div>
                {address && pool.userLpBalance && (
                  <>
                    {parseFloat(pool.userLpBalance) > 0 && (
                      <div className="bg-forground  shadow-md mb-3 p-6">
                        <span className="w-full flex items-center justify-between">
                          <h2 className="text-lg font-medium ">
                            Remove Liquidity
                          </h2>
                          <div>{pool.userLpBalance} LP</div>
                        </span>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Amount to remove: {percentToRemove}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={percentToRemove}
                              onChange={(e) =>
                                setPercentToRemove(parseInt(e.target.value))
                              }
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="flex justify-between mt-2">
                              {" "}
                              <button
                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                                onClick={() => setPercentToRemove(0)}
                              >
                                0%
                              </button>
                              <button
                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                                onClick={() => setPercentToRemove(25)}
                              >
                                25%
                              </button>
                              <button
                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                                onClick={() => setPercentToRemove(50)}
                              >
                                50%
                              </button>
                              <button
                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                                onClick={() => setPercentToRemove(75)}
                              >
                                75%
                              </button>
                              <button
                                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                                onClick={() => setPercentToRemove(100)}
                              >
                                100%
                              </button>
                            </div>
                          </div>
                          {address ? (
                            <>
                              {percentToRemove > 0 && (
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                  <h3 className="text-sm font-medium mb-2">
                                    You will receive:
                                  </h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>{pool.token0.symbol}:</span>
                                      <span>
                                        {expectedReturns()?.amount0?.toFixed(6)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>{pool.token1.symbol}:</span>
                                      <span>
                                        {expectedReturns()?.amount1?.toFixed(6)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <Button
                                variant={"secondary"}
                                onClick={handleRemoveLiquidity}
                                disabled={
                                  percentToRemove === 0 || isRemovingLiquidity
                                }
                                className={`w-full py-2 px-4 disabled:cursor-wait font-medium  transition
                          ${
                            percentToRemove === 0 || isRemovingLiquidity
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                              >
                                {isRemovingLiquidity ? (
                                  <div className="flex justify-center items-center">
                                    <Skeleton className="h-10 w-40 bg-subtitle" />
                                    Removing...
                                  </div>
                                ) : (
                                  "Remove Liquidity"
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              <ConnectButton />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
