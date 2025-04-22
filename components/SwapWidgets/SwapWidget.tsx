"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React, { useEffect } from "react";
import { Button } from "../ui/Button";
import AmountInput from "./AmountInput";
import { useTokenInitializer } from "@/hooks/useTokenInitializer";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { FaGear } from "react-icons/fa6";
import { SlippageModal } from "../Slippage/SlippageModal";
import { useAccountState } from "@/state/accountStore";

type Props = {};

export const SwapWidget = (props: Props) => {
  const { address } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  const { signer } = useAccountState();

  const {
    TokenA,
    TokenB,
    tokens,
    TokenAAmount,
    currentBuyAsset,
    TokenBAmount,
    currentSellAsset,
    tradeDirection,
  } = useSwapState();
  const {
    setTokenB,
    setTokenA,
    setTokenAAmount,
    setTokenBAmount,
    setCurrentSellAsset,
    setCurrentBuyAsset,
    setTradeDirection,
  } = useSwapActions();
  const handleToggleTradeDirection = () => {
    // Toggle direction
    const newDirection = tradeDirection === "sell" ? "buy" : "sell";
    setTradeDirection(newDirection);

    // Swap token names
    setTokenA(TokenB);
    setTokenB(TokenA);

    // Swap full token details (if needed)
    setCurrentSellAsset(currentBuyAsset);
    setCurrentBuyAsset(currentSellAsset);
  };

  return (
    <div className="bg-[#030D0A] p-4 col-span-2 max-w-[448px] w-full border-secondary border-[1px]  rounded-xl">
      <div className="flex w-full justify-between ">
        <h2 className="text-lg font-bold text-white bg-primary w-fit px-2 py-1 rounded-3xl mb-4">
          Swap
        </h2>
        <div>
          <SlippageModal />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <AmountInput
          title="You're Buying"
          token={TokenB}
          Amount={TokenBAmount}
          currentTokenAsset={currentBuyAsset}
          setCurrentTokenDetal={setCurrentBuyAsset}
          setAmount={setTokenBAmount}
          setToken={setTokenB}
          walletBalanceAsset={500} // Replace with actual balance
        />
        <button onClick={handleToggleTradeDirection}>🔁</button>
        <AmountInput
          title="You're Selling"
          setCurrentTokenDetal={setCurrentSellAsset}
          token={TokenA}
          currentTokenAsset={currentSellAsset}
          Amount={TokenAAmount}
          setAmount={setTokenAAmount}
          setToken={setTokenA}
          walletBalanceAsset={1000} // Replace with actual balance
        />
      </div>
      {!address ? (
        <Button
          onClick={openConnectModal}
          variant={"primary"}
          className="w-full mt-4 py-3  text-white font-bold rounded"
        >
          Connect
        </Button>
      ) : (
        <Button
          variant={"primary"}
          className="w-full mt-4 py-3  text-white font-bold rounded"
        >
          Swap
        </Button>
      )}
    </div>
  );
};
