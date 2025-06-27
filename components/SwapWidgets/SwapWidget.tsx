"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import AmountInput from "./AmountInput";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SlippageModal } from "../Slippage/SlippageModal";
import { useAccountState } from "@/state/accountStore";
import rotateImage from "@/public/rotateToken.svg";
import Image from "next/image";
import { useSwapTransactions } from "@/hooks/useSwapTransaction";
import { QuoteDetails } from "./QuoteDetails";
import TokenConversion from "@/services/TokenConversion";
import { usePriceState } from "@/state/priceStore";
import { FaChartSimple } from "react-icons/fa6";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Token } from "@/lib/types";
import { debounce, updateMetaTags } from "@/services/seoFunctions";

type Props = {};

// Utility function to update meta tags for SEO

export const SwapWidget = (props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
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
    token0,
    token1,
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
    setToken1,
    setToken0,
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
    setToken0(token1);
    setToken1(token0);
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

  const updateSwapURL = useCallback(
    debounce((tokenInAddress?: string, tokenOutAddress?: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (tokenInAddress) params.set("currencyIn", tokenInAddress);
      if (tokenOutAddress) params.set("currencyOut", tokenOutAddress);

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300),
    [pathname, router, searchParams]
  );

  const findTokenByAddress = (address: string) => {
    if (!address) return;
    // Convert address to lowercase for case-insensitive comparison
    const normalizedAddress = address.toLowerCase();
    return tokens.find(
      (token) => token.symbol.toLowerCase() === normalizedAddress
    );
  };

  const handleSellTokenSelect = (selectedToken: Token) => {
    setToken0(selectedToken.symbol);
    setCurrentSellAsset(selectedToken);
    setTokenABalance(selectedToken.balance || "0");
    setChartActiveToken(selectedToken.symbol.toUpperCase());

    // Update URL
    updateSwapURL(selectedToken.symbol, undefined);

    // Update meta tags
    const currentBuySymbol = token1 || "Token";
    updateMetaTags(selectedToken.symbol, currentBuySymbol);
  };

  const handleBuyTokenSelect = (selectedToken: Token) => {
    setToken1(selectedToken.symbol);
    setCurrentBuyAsset(selectedToken);
    setTokenBBalance(selectedToken.balance || "0");

    // Update URL
    updateSwapURL(undefined, selectedToken.symbol);

    // Update meta tags
    const currentSellSymbol = token0 || "Token";
    updateMetaTags(currentSellSymbol, selectedToken.symbol);
  };

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
          setToken0(foundToken.symbol);
          setCurrentSellAsset(foundToken);
          setChartActiveToken(foundToken.symbol.toUpperCase());
          if (foundToken.balance) {
            setTokenABalance(foundToken.balance);
          }
        }
      }

      if (tokenOut) {
        const foundToken = findTokenByAddress(tokenOut);
        if (foundToken) {
          setToken1(foundToken.symbol);
          setCurrentBuyAsset(foundToken);
          if (foundToken.balance) {
            setTokenBBalance(foundToken.balance);
          }
        }
      }

      // Update meta tags after loading from URL
      const sellSymbol = token0 || "ETH";
      const buySymbol = token1 || "STX";
      updateMetaTags(sellSymbol, buySymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tokens]);

  useEffect(() => {
    if (token0 && token1) {
      updateMetaTags(token0, token1);
    }
  }, [token0, token1]);

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
    <div className=" flex flex-col border-[1px] py-4 rounded-lg border-border bg-background gap-3 items-center justify-center  relative  w-full">
      <div className="text-3xl px-4 font-semibold w-full justify-start items-center ">
        Trade
        <TokenConversion
          prices={prices}
          isLoading={isLoading}
          from={token0}
          to={token1}
        />
      </div>
      <div className="flex w-full px-4 justify-between">
        <h2 className="text-lg  font-bold text-white bg-primary w-fit px-2 py-1 rounded-lg ">
          Swap
        </h2>
        <div className="flex flex-row gap-2 items-center">
          <FaChartSimple
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
        <div className="flex   w-full gap-6 flex-col relative ">
          <AmountInput
            title="You're Selling"
            loadingBalances={loadingBalances}
            walletBalanceAsset={tokenABalance} // Replace with actual balance
            setCurrentTokenDetail={handleSellTokenSelect}
            token={token0}
            currentTokenAsset={currentSellAsset}
            Amount={TokenAAmount}
            tokenUsdValue={TokenAUsdValue}
            setAmount={setTokenAAmount}
            setToken={setToken0}
            exceedsBalanceError={exceedsBalanceError}
            isConnected={isConnected}
            setTokenBalance={setTokenABalance}
            className=""
          />

          <div
            onClick={handleToggleTradeDirection}
            className="absolute top-1/2  cursor-pointer border-border  left-[15%] bg-primary -translate-y-[50%]  z-[1] bg- p-1 border"
          >
            <Image
              src={rotateImage}
              width={20}
              height={20}
              alt="rotate"
              className={`  invert transition-transform duration-300  ${
                isRotated ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>

          <hr className="-mx-3 border-t border-border" />


          <AmountInput
            title="You're Buying"
            loadingBalances={loadingBalances}
            className="bg-forground border-border"
            setAmount={setTokenBAmount}
            setToken={setToken1}
            walletBalanceAsset={tokenBBalance} // Replace with actual balance
            token={token1}
            Amount={TokenBAmount}
            currentTokenAsset={currentBuyAsset}
            tokenUsdValue={TokenBUsdValue}
            setCurrentTokenDetail={handleBuyTokenSelect}
            isLoading={quoteLoading}
            readOnly={true}
            setTokenBalance={setTokenBBalance}
            // setAmount={setTokenBAmount}
            // setToken={setToken1}
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
