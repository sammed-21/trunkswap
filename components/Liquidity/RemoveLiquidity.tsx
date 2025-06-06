"use client";
import { useCallback, useState } from "react";
import {
  Pool,
  useLiqudityState,
  useLiquidityActions,
} from "@/state/liquidityStore";
import { useAccount, useChainId } from "wagmi";
import { useAccountState } from "@/state/accountStore";
import { Button } from "@/components/ui/Button";
import { useRemoveLiquidityLogic } from "@/hooks/useRemoteLiquidityLogic";
import ConnectWallet from "../Common/ConnectWallet";
import { formatDigits } from "@/lib/utils";

interface Props {
  pool: Pool;
}
export const RemoveLiquidity = ({ pool }: Props) => {
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    isRemovingLiquidity,
    percentToRemove,
    isLpApproving,
    transactionRemoveLiquidityText,
    needsApprovalLP,
  } = useLiqudityState();

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

  return (
    <div>
      {" "}
      {/* {Number(pool.userLpBalance) > 0 && ( */}
      <div className="bg-forground rounded-lg shadow-md mb-3 p-6">
        <span className="w-full flex items-center justify-between">
          <h2 className="text-lg font-medium ">Remove Liquidity</h2>
          <div>{formatDigits(pool.userLpBalance)} LP</div>
        </span>
        <div className="space-y-4">
          <div className="">
            <label className="block text-sm py-4 font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount to remove:{" "}
              <span className="h-32 w-full flex items-center mx-auto justify-center text-9xl font-black">
                {percentToRemove}%
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentToRemove}
              onChange={(e) => setPercentToRemove(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between mt-2">
              {" "}
              <Button
                variant={"transparent"}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setPercentToRemove(0)}
              >
                0%
              </Button>
              <Button
                variant={"transparent"}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setPercentToRemove(25)}
              >
                25%
              </Button>
              <Button
                variant={"transparent"}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setPercentToRemove(50)}
              >
                50%
              </Button>
              <Button
                variant={"transparent"}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setPercentToRemove(75)}
              >
                75%
              </Button>
              <Button
                variant={"transparent"}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() => setPercentToRemove(100)}
              >
                100%
              </Button>
            </div>
          </div>
          {address ? (
            <>
              {percentToRemove > 0 && (
                <div className="p-4 bg-forground border-[1px] border-border rounded-lg">
                  <h3 className="text-sm font-medium mb-2">
                    You will receive:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{pool.token0.symbol}:</span>
                      <span>{expectedReturns()?.amount0?.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{pool.token1.symbol}:</span>
                      <span>{expectedReturns()?.amount1?.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant={"secondary"}
                onClick={() => handleTransaction()}
                disabled={
                  percentToRemove === 0 ||
                  isRemovingLiquidity ||
                  isLpApproving ||
                  Number(selectedPool?.userLpBalance!) === Number(0)
                }
                className={`w-full py-2 px-4 disabled:cursor-wait font-medium  transition
        ${
          percentToRemove === 0
            ? "bg-gray-400 cursor-not-allowed !text-title"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
              >
                {isLpApproving ? (
                  transactionRemoveLiquidityText
                ) : isRemovingLiquidity ? (
                  <div className="flex justify-center items-center">
                    Removing...
                  </div>
                ) : (
                  <>{transactionRemoveLiquidityText}</>
                )}
              </Button>
            </>
          ) : (
            <>
              <ConnectWallet />
            </>
          )}
        </div>
      </div>
      {/* )} */}
    </div>
  );
};
