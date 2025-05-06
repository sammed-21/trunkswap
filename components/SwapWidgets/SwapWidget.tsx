"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useCallback, useState } from "react";
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

type Props = {};

export const SwapWidget = (props: Props) => {
  const {
    needsApproval,
    isApproving,
    isSwapping,
    handleTransaction,
    quoteLoading,
  } = useSwapTransactions();

  const { provider } = useAccountState();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

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
    prices,
  } = useSwapState();
  const {
    setTokenB,
    setTokenA,
    setTokenAAmount,
    setTokenBAmount,
    setCurrentSellAsset,
    setCurrentBuyAsset,
    setTradeDirection,
    setTokenABalance,
    setTokenBBalance,
    setTokenBUsdValue,

    setTokenAUsdValue,
    setTokenAUsdPrice,
    setTokenBUsdPrice,
  } = useSwapActions();
  const handleToggleTradeDirection = () => {
    // Toggle direction
    const newDirection = tradeDirection === "sell" ? "buy" : "sell";
    setTradeDirection(newDirection);
    setIsRotated((prev) => !prev);
    setTokenABalance(tokenBBalance);
    setTokenBBalance(tokenABalance);
    // Swap token names
    setTokenA(TokenB);
    setTokenB(TokenA);

    setTokenBUsdValue(TokenAUsdValue); // need to add this in the to updatet he amount and fetch the usd amount instanntyl
    setTokenAUsdValue(TokenBUsdValue); // need to add this in the to updatet he amount and fetch the usd amount instanntyl
    // setTokenAUsdPrice(TokenBUsdPrice);
    // setTokenBUsdPrice(TokenAUsdPrice);
    // Swap full token details (if needed)
    setCurrentSellAsset(currentBuyAsset);
    setCurrentBuyAsset(currentSellAsset);
  };

  // Optional: if you have ETH price fetched from CoinGecko

  const getButtonProps = useCallback(() => {
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
  }, [tokenABalance, TokenAAmount]);

  const buttonProps = getButtonProps();

  return (
    <div className=" flex flex-col  gap-3 items-center justify-center p-3  w-full">
      <div className="  p-4 col-span-2 max-w-[448px] w-full  ">
        <div className="flex w-full mb-2 items-center justify-between ">
          <h2 className="text-lg font-bold text-white bg-primary w-fit px-2 py-1 rounded-none ">
            Swap
          </h2>
          <div>
            <SlippageModal />
          </div>
        </div>
        <div className="flex w-full flex-col relative">
          <AmountInput
            title="You're Selling"
            // setCurrentTokenDetal={setCurrentSellAsset}
            // token={TokenB}
            // currentTokenAsset={currentSellAsset}
            // Amount={TokenBAmount}
            // setAmount={setTokenAAmount}
            // setToken={setTokenB}
            loadingBalances={loadingBalances}
            walletBalanceAsset={tokenABalance} // Replace with actual balance
            setCurrentTokenDetal={setCurrentSellAsset}
            token={TokenA}
            currentTokenAsset={currentSellAsset}
            Amount={TokenAAmount}
            tokenUsdValue={TokenAUsdValue}
            setAmount={setTokenAAmount}
            setToken={setTokenA}
          />
          <div
            onClick={handleToggleTradeDirection}
            className="absolute top-1/2 bg- border-border left-[45%] bg-primary -translate-y-1/2  z-[1] bg- p-2 border"
          >
            <Image
              src={rotateImage}
              width={25}
              height={25}
              alt="rotate"
              className={` dark:invert  transition-transform duration-300  ${
                isRotated ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          <AmountInput
            title="You're Buying"
            // token={TokenA}
            // Amount={TokenAAmount}
            // currentTokenAsset={currentSellAsset}
            loadingBalances={loadingBalances}
            // setCurrentTokenDetal={setCurrentSellAsset}
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
            // setAmount={setTokenBAmount}
            // setToken={setTokenB}
          />
        </div>
        {isConnected ? (
          <Button
            onClick={handleTransaction}
            variant={"primary"}
            disabled={buttonProps.disabled}
            className="w-full mt-4 py-3 disabled:cursor-not-allowed  text-title font-bold  "
          >
            {buttonProps.text}
          </Button>
        ) : (
          <Button
            variant={"primary"}
            className="w-full mt-4 py-3  text-title font-bold  "
            onClick={openConnectModal}
          >
            Connect
          </Button>
        )}
      </div>
      <TokenConversion prices={prices} from={TokenA} to={TokenB} />

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
          />
        </>
      )}
    </div>
  );
};
