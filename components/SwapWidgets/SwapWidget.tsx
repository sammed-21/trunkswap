"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import AmountInput from "./AmountInput";
import { useAccount, useCall } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SlippageModal } from "../Slippage/SlippageModal";
import { useAccountState } from "@/state/accountStore";
import rotateImage from "@/public/rotateToken.svg";
import Image from "next/image";
import { useSwapTransactions } from "@/hooks/useSwapTransaction";
import { QuoteDetails } from "./QuoteDetails";
import TokenConversion from "@/services/TokenConversion";
import { usePriceState } from "@/state/priceStore";
import { Skeleton } from "../ui/skeleton";
import { FaChartLine } from "react-icons/fa6";
import { useRouter, useSearchParams } from "next/navigation";
import { Token } from "@/lib/types";

type Props = {};

export const SwapWidget = (props: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    needsApproval,
    isApproving,
    isSwapping,
    handleTransaction,
    quoteLoading,
  } = useSwapTransactions();

  const { provider } = useAccountState();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { prices, isLoading } = usePriceState();
  const { resetSwapState } = useSwapActions();

  const [isRotated, setIsRotated] = useState<boolean>(false);
  const {
    TokenA,
    TokenB,
    tokens,
    TokenAAmount,
    currentBuyAsset,
    TokenBAmount,
    currentSellAsset,
    tradeDirection,
    tokenABalance,
    loadingBalances,
    tokenBBalance,
    transactionButtonText,
    quoteAmount,
    minAmountOut,
    estimateFees,
    fee,
    slippage,
    priceImpact,
    TokenAUsdValue,
    TokenBUsdValue,
    TokenAUsdPrice,
    TokenBUsdPrice,
    chartFlag,

    exceedsBalanceError,
  } = useSwapState();

  const {
    setTokenB,
    setTokenA,
    setTokenAAmount,
    setTokenBAmount,
    setCurrentSellAsset,
    setCurrentBuyAsset,
    setTradeDirection,
    setDeadline,
    setTokenABalance,
    setTokenBBalance,
    setTokenBUsdValue,
    setTokenAUsdValue,
    setTokenAUsdPrice,
    setSlippage,
    setTokenBUsdPrice,
    setChartFlag,
    setChartActiveToken,
  } = useSwapActions();

  // Optional: if you have ETH price fetched from CoinGecko

  const handleToggleTradeDirection = () => {
    // Toggle direction
    const newDirection = tradeDirection === "sell" ? "buy" : "sell";
    setTradeDirection(newDirection);
    setIsRotated((prev) => !prev);
    setTokenABalance(tokenBBalance);
    setTokenBBalance(tokenABalance);
    setTokenA(TokenB);
    setTokenB(TokenA);
    setTokenAAmount("");
    setTokenBAmount("");
    setTokenBUsdValue(null);
    setChartActiveToken(currentSellAsset.symbol.toUpperCase());
    setTokenAUsdValue(null);
    setCurrentSellAsset(currentBuyAsset);
    setCurrentBuyAsset(currentSellAsset);
    resetSwapState();

    // const urlParams = new URLSearchParams();
    // urlParams.set("currencyIn", currentSellAsset.address);
    // urlParams.set("currencyOut", currentBuyAsset.address);
    // router.replace(`/swap?${urlParams.toString()}`, {
    //   scroll: false,
    // });
  };
  const findTokenByAddress = (address: string) => {
    if (!address) return;
    // Convert address to lowercase for case-insensitive comparison
    const normalizedAddress = address.toLowerCase();
    return tokens.find(
      (token) => token.address.toLowerCase() === normalizedAddress
    );
  };

  // Handle URL parameters on component mount
  useEffect(() => {
    const tokenIn =
      searchParams?.get("currencyIn") || searchParams?.get("tokenIn");
    const tokenOut =
      searchParams?.get("currencyOut") || searchParams?.get("tokenOut");

    // If we have parameters, update the state
    if (tokenIn || tokenOut) {
      if (tokenIn) {
        const foundToken = findTokenByAddress(tokenIn);
        if (foundToken) {
          setTokenA(foundToken?.symbol);
          setCurrentSellAsset(foundToken);
          setChartActiveToken(foundToken?.symbol?.toUpperCase());
          if (foundToken.balance) {
            setTokenABalance(foundToken?.balance);
          }
        }
      }

      if (tokenOut) {
        const foundToken = findTokenByAddress(tokenOut);

        if (foundToken) {
          setTokenB(foundToken.symbol);
          setCurrentBuyAsset(foundToken);

          if (foundToken.balance) {
            setTokenBBalance(foundToken?.balance);
          }
        }
      }
    }
    // Only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const getButtonProps = () => {
    if (!isConnected) {
      return {
        onClick: openConnectModal,
        text: "Connect",
        disabled: false,
      };
    } else if (Number(tokenABalance) === 0) {
      return {
        onClick: () => {},
        text: "Insufficent Balance",
        disabled: true,
      };
    } else if (isApproving || isSwapping) {
      return {
        onClick: () => {},
        text: transactionButtonText,
        disabled: true,
      };
    } else if (needsApproval) {
      return {
        onClick: handleTransaction,
        text: "Approve",
        disabled: false,
      };
    } else {
      return {
        onClick: handleTransaction,
        text: quoteLoading ? "Fetching Quote..." : "Swap",
        disabled: quoteLoading || !TokenAAmount || !TokenBAmount,
      };
    }
  };
  const buttonProps = getButtonProps();
  return (
    <div className=" flex flex-col  gap-3 items-center justify-center  w-full">
      <div className="text-3xl font-semibold w-full justify-start items-center ">
        Trade
        <TokenConversion
          prices={prices}
          isLoading={isLoading}
          from={TokenA}
          to={TokenB}
        />
      </div>
      <div className="flex w-full  justify-between">
        <h2 className="text-lg font-bold text-white bg-primary w-fit px-2 py-1 rounded-none ">
          Swap
        </h2>
        <div className="flex flex-row gap-2 items-center">
          <FaChartLine
            onClick={() => setChartFlag(!chartFlag)}
            color={`${chartFlag ? "#fff" : "#0caaff "}`}
            className={` w-6 h-6 ${
              chartFlag
                ? "bg-[#0caaff] p-1 text-white"
                : "bg-forground p-1 text-white"
            } cursor-pointer`}
          />
          <SlippageModal
            setDeadline={setDeadline}
            setSlippage={setSlippage}
            slippage={slippage}
          />
        </div>
      </div>
      <div className="  col-span-2 max-w-[448px] w-full  ">
        <div className="flex   w-full gap-3 flex-col relative">
          <AmountInput
            title="You're Selling"
            loadingBalances={loadingBalances}
            walletBalanceAsset={tokenABalance} // Replace with actual balance
            setCurrentTokenDetal={setCurrentSellAsset}
            token={TokenA}
            currentTokenAsset={currentSellAsset}
            Amount={TokenAAmount}
            tokenUsdValue={TokenAUsdValue}
            setAmount={setTokenAAmount}
            setToken={setTokenA}
            exceedsBalanceError={exceedsBalanceError}
            isConnected={isConnected}
            setTokenBalance={setTokenABalance}
          />
          <div
            onClick={handleToggleTradeDirection}
            className="absolute top-1/2  cursor-pointer border-border left-[45%] bg-primary -translate-y-1/2  z-[1] bg- p-1 border"
          >
            <Image
              src={rotateImage}
              width={20}
              height={20}
              alt="rotate"
              className={` dark:invert  transition-transform duration-300  ${
                isRotated ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          <AmountInput
            title="You're Buying"
            loadingBalances={loadingBalances}
            setAmount={setTokenBAmount}
            setToken={setTokenB}
            walletBalanceAsset={tokenBBalance} // Replace with actual balance
            token={TokenB}
            Amount={TokenBAmount}
            currentTokenAsset={currentBuyAsset}
            tokenUsdValue={TokenBUsdValue}
            setCurrentTokenDetal={setCurrentBuyAsset}
            isLoading={quoteLoading}
            readOnly={true}
            setTokenBalance={setTokenBBalance}
            // setAmount={setTokenBAmount}
            // setToken={setTokenB}
          />
        </div>
        {isConnected ? (
          <Button
            onClick={handleTransaction}
            variant={"primary"}
            disabled={buttonProps.disabled}
            className="w-full mt-4 py-3 disabled:cursor-not-allowed text-white font-semibold  "
          >
            {buttonProps.text}
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

      {quoteAmount && (
        <>
          <QuoteDetails
            maxReceived={TokenBAmount}
            isLoading={quoteLoading}
            minReceived={minAmountOut.formatted}
            slippage={slippage}
            fee={fee}
            networkFee={estimateFees.estimatedFee}
            networkFeeUsd={estimateFees.formatedEstimatedFee}
            routingSource="trunkswap"
            buySymbol={currentBuyAsset?.symbol || ""}
            sellSymbol={currentSellAsset?.symbol || ""}
            priceImpact={priceImpact}
            prices={prices}
            address={address}
          />
        </>
      )}
    </div>
  );
};
