"use client";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React from "react";
import { Button } from "../ui/Button";

type Props = {};

export const SwapWidget = (props: Props) => {
  const { sellToken, buyToken, sellAmount, buyAmount } = useSwapState();
  const { setBuyToken, setSellToken, setSellAmount, setBuyAmount } =
    useSwapActions();

  return (
    <div className="bg-primary/20 border-secondary border-[2px]  rounded-xl">
      <h2 className="text-xl font-bold text-white mb-4">Swap</h2>
      <div className="mb-4">
        <label className="text-sm text-gray-400">you are buying</label>
        <select
          className="w-full mt-2 p-3 bg-gray-700 rounded text-white"
          value={buyToken}
          onChange={(e) => setBuyToken(e.target.value)}
        >
          <option value="DAI">DAI</option>
          <option value="USDC">USDC</option>
        </select>
        <input
          type="number"
          placeholder="Enter amount"
          className="w-full mt-2 p-3 bg-gray-700 rounded text-white"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="text-sm text-gray-400">you are Selling</label>
        <select
          className="w-full mt-2 p-3 bg-gray-700 rounded text-white"
          value={sellToken}
          onChange={(e) => setSellToken(e.target.value)}
        >
          <option value="DAI">DAI</option>
          <option value="USDC">USDC</option>
        </select>
        <input
          type="number"
          placeholder="Enter amount"
          className="w-full mt-2 p-3 bg-gray-700 rounded text-white"
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
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
