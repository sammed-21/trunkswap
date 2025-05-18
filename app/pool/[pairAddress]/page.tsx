"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  formatPercentage,
  getBlockchainExplorer,
  shortenAddress,
} from "@/lib/utils";
import { TradingViewWidget } from "@/components/Chart/TradingViewWidget";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import ConnectWallet from "@/components/Common/ConnectWallet";
import { Button } from "@/components/ui/Button";
import { getProvider } from "@/services/getProvider";
import { CopyAddress } from "@/components/Common/CopyAddress";
import { useRemoveLiquidityLogic } from "@/hooks/useRemoteLiquidityLogic";
import { LoadingScreen } from "@/components/Common/LoadingScreen";
import { RemoveLiquidity } from "@/components/Liquidity/RemoveLiquidity";
import AddLiquidityComponent from "@/components/Liquidity/AddLiquidityComponent";
import { MainLiquidityComponent } from "@/components/Liquidity/MainLiquidityComponent";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BreadcrumbDemo } from "@/components/Common/BreadCrumbComponent";
import { LiquidityDetails } from "@/components/Liquidity/LiquidityDetails";

interface PoolDetailPageProps {
  params: {
    pairAddress: string;
  };
}

export default function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { pairAddress } = params;
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<Pool | null>(null);
  const [removingLiquidity, setRemovingLiquidity] = useState(false);

  // Get data from stores
  const { isConnected, address } = useAccount();
  const { provider, signer } = useAccountState();
  const { fetchPoolDetails, setSelectedPool, fetchPools, setPercentToRemove } =
    useLiquidityActions();

  const { removeLiquidity, ApproveLP, handleApproveLP, handleTransaction } =
    useRemoveLiquidityLogic();
  const {
    selectedPool,
    selectedTokenA,
    selectedTokenB,
    isRemovingLiquidity,
    percentToRemove,
    isLpApproving,
    transactionRemoveLiquidityText,
    needsApprovalLP,
  } = useLiqudityState();

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
    signer,
    isConnected,
    fetchPoolDetails,
    fetchPools,
    selectedPool,
    setSelectedPool,
  ]);
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
    }, [percentToRemove]);

  const expectedReturns = getExpectedReturns();
  // Format address for display
  return (
    <div className="flex flex-col  gap-4 px-3 mb-10 w-full mx-auto justify-center items-start ">
      <div className="flex-1 flex items-center  max-w-[1440px] py-6  w-full justify-start mx-auto  ">
        {selectedTokenA && selectedTokenB && (
          <BreadcrumbDemo symbol0={selectedTokenA} symbol1={selectedTokenB} />
        )}
      </div>
      <div className=" flex gap-4 max-w-[1440px] justify-center w-full mx-auto">
        {/* Navigation */}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            {/* <Skeleton className="h-10 w-40 bg-subtitle" /> */}
            <LoadingScreen title="Loading Pool Data" />
          </div>
        )}

        {/* Pool details */}
        {!isLoading && pool && (
          <div className="space-b-6 flex-4 flex flex-col-reverse lg:flex-row gap-4 w-full">
            <div className="flex flex-col gap-4 w-full">
              {/* Header */}
              <div className="bg-forground rounded-lg   lg:fex shadow-md flex flex-row  justify-between items-center gap-4 p-6">
                <div>
                  <h1 className="text-2xl font-bold">{`${pool.token0.symbol}/${pool.token1.symbol}`}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Pair address: {shortenAddress(pool.pairAddress)}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <Link
                    href={`/swap?currencyIn=${pool.token0.address}&currencyOut=${pool.token1.address}`}
                  >
                    <Button variant={"secondary"}>Swap</Button>
                  </Link>
                </div>
              </div>

              <div className="bg-forground flex-2 relative h-[500px] rounded-lg shadow-md p-6">
                <TradingViewWidget />
              </div>
              <div className=" block lg:hidden max-w-[500px] flex-3 w-full min-h-[800px] max-lg:mx-auto   ">
                {pool && (
                  <>
                    <MainLiquidityComponent pool={pool} />
                  </>
                )}
              </div>
              {
                <LiquidityDetails
                  pool={pool}
                  getUserPositionValue={getUserPositionValue}
                  address={address}
                />
              }
            </div>

            <div className=" hidden lg:block max-w-[500px] flex-3 w-full min-h-[800px] max-lg:mx-auto   ">
              {pool && (
                <>
                  <MainLiquidityComponent pool={pool} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
