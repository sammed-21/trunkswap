"use client";
import {
  Pool,
  useLiqudityState,
  useLiquidityActions,
} from "@/state/liquidityStore";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatUnits } from "ethers";
import { useAccount } from "wagmi";
// import { Pool, useLiqudityState } from "@/state/liquidityStore";
import TokenInput from "@/components/Pool/TokenInput";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddLiquidityLogic } from "@/hooks/useLiquidityLogic";
import { SlippageModal } from "@/components/Slippage/SlippageModal";
import { Button } from "@/components/ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatDigits } from "@/lib/utils";
import { LoadingScreen } from "@/components/Common/LoadingScreen";
import { useMemo } from "react";

import AddLiquidityComponent from "./AddLiquidityComponent";
import { RemoveLiquidity } from "./RemoveLiquidity";
import { usePriceState } from "@/state/priceStore";
import AmountInput from "../SwapWidgets/AmountInput";
import TokenConversion from "@/services/TokenConversion";
import { AnimatedTooltip } from "../ui/animated-tooltip";
type Props = {
  pool: Pool;
};

export const MainLiquidityComponent = ({ pool }: Props) => {
  const router = useRouter();
  //   const { token0, token1 } = params;
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { prices } = usePriceState();
  const tokenAddresses = useMemo(
    () => ({
      token0: pool.token0.address,
      token1: pool.token1.address,
    }),
    [pool.token0.address, pool.token1.address]
  );

  const {
    selectedToken0,
    selectedToken1,
    selectedPool,
    transactionButtonText,
    tokenAAmount,
    selectedTokenABalance,
    selectedTokenBBalance,
    isUserTokenbalance,
    tokenBAmount,
    isApprovingTokenA,
    isApprovingTokenB,
    needsApprovalTokenA,
    needsApprovalTokenB,
    isAddingLiquidity,
    expectedLPToken,
    transactionTokenAButtonText,
    slippage,
    transactionTokenBButtonText,
    defaultLiquidityTag,
  } = useLiqudityState();

  const {
    isLoading,
    error,
    tokenAUsdValue,
    tokenBUsdValue,
    setSlippage,
    handleTokenAInput,
    handleTokenBInput,
    handleAddLiquidity,
    handleApproveTokenA,
    handleApproveTokenB,
    handleTransaction,
    setDeadline,
    expectedLPTokens,
    poolShare,
    deadline,
  } = useAddLiquidityLogic(tokenAddresses.token0, tokenAddresses.token1);
  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-96">
  //       {/* <Skeleton className="h-10 w-40 bg-subtitle" /> */}
  //       <LoadingScreen />
  //     </div>
  //   );
  // }

  if (error && !selectedToken0 && !selectedToken1) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
          Error
        </h2>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <Link
          href="/pools"
          className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Return to Pools
        </Link>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultLiquidityTag} className="w-full md:w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="Add">Add</TabsTrigger>
        <TabsTrigger value="Remove">Remove</TabsTrigger>
      </TabsList>
      {selectedToken0 && selectedToken1 && (
        <>
          <div className=" border-[1px] h-fit p-3 rounded-md border-border my-2">
            <TokenConversion
              prices={prices}
              from={selectedToken0?.symbol}
              to={selectedToken1?.symbol}
              isLoading={false}
              className="flex flex-col    h-fit justify-start rounded-md items-start"
            >
              {selectedToken0.symbol}/{selectedToken1.symbol}
            </TokenConversion>
          </div>
        </>
      )}
      <TabsContent value="Add" className="mt-6">
        {/* <AddLiquidityComponent pool={pool} /> */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-6">
            <span className="flex items-start justify-start flex-col  ">
              <h1 className="text-2xl font-bold  text-title">Add Liquidity</h1>
              <p>Provide liquidity to receive LP tokens.</p>
            </span>
            <SlippageModal
              setDeadline={setDeadline}
              setSlippage={setSlippage}
              slippage={slippage}
            />
          </div>

          {/* {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300">
          {error}
          </div>
          )} */}

          <div className="space-y-4">
            {/* Token A Input */}

            <TokenInput
              label="Token A"
              token={selectedToken0}
              isLoading={isLoading}
              value={tokenAAmount}
              onChange={handleTokenAInput}
              usdValue={tokenAUsdValue}
              disabled={isAddingLiquidity}
              tokenBalnce={selectedTokenABalance}
              isBalanceLoading={isUserTokenbalance}
            />
            {address && Number(tokenAAmount) != parseFloat("0") && (
              <>
                {Number(tokenAAmount) > Number(selectedTokenABalance) ||
                (Number(selectedTokenABalance) && Number(tokenAAmount)) == 0 ? (
                  <>
                    {" "}
                    <Button
                      variant="secondary"
                      className="w-full py-3 cursor-not-allowed text-white font-semibold"
                    >
                      InSufficient {selectedToken0?.symbol} Balance
                    </Button>
                  </>
                ) : (
                  <>
                    {transactionTokenAButtonText &&
                      tokenAAmount !== "0" &&
                      needsApprovalTokenA && (
                        <Button
                          onClick={handleApproveTokenA}
                          variant="primary"
                          disabled={
                            isApprovingTokenA ||
                            isAddingLiquidity ||
                            transactionTokenAButtonText.startsWith(
                              "Insufficient"
                            )
                          }
                          className="w-full py-3 disabled:cursor-not-allowed text-white font-semibold"
                        >
                          {transactionTokenAButtonText}
                        </Button>
                      )}
                  </>
                )}
              </>
            )}

            {/* Plus icon between inputs */}
            <div className="flex justify-center">
              <div className="bg-primary  p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
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
              token={selectedToken1}
              isLoading={isLoading}
              value={tokenBAmount}
              onChange={handleTokenBInput}
              usdValue={tokenBUsdValue}
              disabled={isAddingLiquidity}
              tokenBalnce={selectedTokenBBalance}
              isBalanceLoading={isUserTokenbalance}
            />
            {address && Number(tokenBAmount) != parseFloat("0") && (
              <>
                {Number(tokenBAmount) > Number(selectedTokenBBalance) ||
                (Number(selectedTokenBBalance) && Number(tokenBAmount)) == 0 ? (
                  <>
                    {" "}
                    <Button
                      variant="secondary"
                      className="w-full py-3 cursor-not-allowed text-white font-semibold"
                    >
                      InSufficient {selectedToken1?.symbol} Balance
                    </Button>
                  </>
                ) : (
                  <>
                    {transactionTokenBButtonText &&
                      tokenBAmount !== "0" &&
                      needsApprovalTokenB && (
                        <Button
                          onClick={handleApproveTokenB}
                          variant="primary"
                          disabled={
                            isApprovingTokenB ||
                            isAddingLiquidity ||
                            transactionTokenBButtonText.startsWith(
                              "Insufficient"
                            )
                          }
                          className="w-full py-3 disabled:cursor-not-allowed text-white font-semibold"
                        >
                          {transactionTokenBButtonText}
                        </Button>
                      )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Pool information */}
          {selectedPool && (
            <div className="mt-6 rounded-lg bg-forground p-4  ">
              <h3 className="text-lg font-medium  mb-3">Pool Information</h3>

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
                      {formatDigits(selectedPool.totalSupply)} LP
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Expected LP Tokens
                  </span>
                  <span className="text-gray-800 dark:text-gray-100">
                    {expectedLPToken}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isConnected ? (
            <Button
              onClick={handleTransaction}
              variant={"primary"}
              disabled={
                !tokenAAmount ||
                !tokenBAmount ||
                isAddingLiquidity ||
                Number(tokenBAmount) > Number(selectedTokenBBalance) ||
                Number(tokenAAmount) > Number(selectedTokenABalance)
              }
              className="w-full mt-4 py-3 disabled:cursor-not-allowed text-white font-semibold  "
            >
              {transactionButtonText}
            </Button>
          ) : (
            <Button
              variant={"primary"}
              className="w-full mt-4 py-3  text-title font-semibold  "
              onClick={openConnectModal}
            >
              Connect
            </Button>
          )}
        </div>
      </TabsContent>
      <TabsContent value="Remove">
        <RemoveLiquidity pool={pool} />
      </TabsContent>
    </Tabs>
  );
};
