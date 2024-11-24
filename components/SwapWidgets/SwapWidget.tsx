"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useEffect } from "react";
import { Button } from "../ui/Button";
import AmountInput from "./AmountInput";
import { useTokenInitializer } from "@/hooks/useTokenInitializer";

type Props = {};

export const SwapWidget = (props: Props) => {
  const {
    sellToken,
    buyToken,
    tokens,
    sellAmount,
    currentBuyAsset,
    buyAmount,
    currentSellAsset,
  } = useSwapState();
  const {
    setBuyToken,
    setSellToken,
    setSellAmount,
    setBuyAmount,
    setCurrentSellAsset,
    setCurrentBuyAsset,
  } = useSwapActions();
  console.log({ currentBuyAsset });

  return (
    <div className="bg-[#030D0A] p-4 col-span-2 max-w-[448px] w-full border-secondary border-[1px]  rounded-xl">
      <h2 className="text-lg font-bold text-white bg-primary w-fit px-2 py-1 rounded-3xl mb-4">
        Swap
      </h2>
      <div className="flex flex-col gap-3">
        <AmountInput
          title="You're Buying"
          token={buyToken}
          Amount={buyAmount}
          currentTokenAsset={currentBuyAsset}
          setCurrentTokenDetal={setCurrentBuyAsset}
          setAmount={setBuyAmount}
          setToken={setBuyToken}
          walletBalanceAsset={500} // Replace with actual balance
        />
        <AmountInput
          title="You're Selling"
          setCurrentTokenDetal={setCurrentSellAsset}
          token={sellToken}
          currentTokenAsset={currentSellAsset}
          Amount={sellAmount}
          setAmount={setSellAmount}
          setToken={setSellToken}
          walletBalanceAsset={1000} // Replace with actual balance
        />
      </div>

      <Button
        variant={"primary"}
        className="w-full mt-4 py-3  text-white font-bold rounded"
      >
        Swap
      </Button>
    </div>
  );
};
