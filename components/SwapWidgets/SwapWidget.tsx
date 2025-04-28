"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import AmountInput from "./AmountInput";
import { useTokenInitializer } from "@/hooks/useTokenInitializer";
import { useAccount } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { FaGear } from "react-icons/fa6";
import { SlippageModal } from "../Slippage/SlippageModal";
import { useAccountState } from "@/state/accountStore";
import rotateImage from "@/public/rotateToken.svg";
import Image from "next/image";
import { useSwapTransactions } from "@/hooks/useSwapTransaction";
import { QuoteDetails } from "./QuoteDetails";
import { getProvider } from "@/services/walletEvents";

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
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signer } = useAccountState();
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

    // Swap full token details (if needed)
    setCurrentSellAsset(currentBuyAsset);
    setCurrentBuyAsset(currentSellAsset);
  };

  // Optional: if you have ETH price fetched from CoinGecko

  const getButtonProps = () => {
    if (!isConnected) {
      return {
        onClick: openConnectModal,
        text: "Connect",
        disabled: false,
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
    <div className="bg-primary p-4 col-span-2 max-w-[448px] w-full border-border border-[1px]  ">
      <div className="flex w-full justify-between ">
        <h2 className="text-lg font-bold text-white bg-primary w-fit px-2 py-1 rounded-none mb-4">
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
          setAmount={setTokenAAmount}
          setToken={setTokenA}
        />
        <div
          onClick={handleToggleTradeDirection}
          className="absolute top-1/2 bg-primary border-border left-[45%] bg- -translate-y-1/2   z-10 bg- p-2 border"
        >
          <Image
            src={rotateImage}
            width={25}
            height={25}
            alt="rotate"
            className={`invert  transition-transform duration-300  ${
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
          className="w-full mt-4 py-3  text-white font-bold rounded"
        >
          {buttonProps.text}
        </Button>
      ) : (
        <Button
          variant={"primary"}
          className="w-full mt-4 py-3  text-white font-bold rounded"
          onClick={openConnectModal}
        >
          Connect
        </Button>
      )}
      {/* <div>
      {quoteAmount && minAmountOut && (
  <QuoteDetails
    maxReceived={quoteAmount}
    minReceived={minAmountOut.formatted}
    fee={feeAmount}
    networkFee={networkFee}
    networkFeeUsd={networkFeeUsd}
    routingSource="uniswapv2"
    buySymbol={currentBuyAsset?.symbol || ""}
    sellSymbol={currentSellAsset?.symbol || ""}
  />
)}
      </div> */}
    </div>
  );
};
