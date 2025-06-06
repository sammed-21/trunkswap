"use client";
import React from "react";
import { SwapWidget } from "./SwapWidget";

import { TradingViewWidget } from "@/components/Chart/TradingViewWidget";
import { useSwapState } from "@/state/swapStore";
type Props = {};

export const SwapComponent = (props: Props) => {
  const { chartFlag } = useSwapState();

  return (
    <div className="flex w-full flex-row gap-4  max-w-[1424px] mb-2 items-start justify-center ">
      <div className="flex w-full max-lg:hidden mx-auto gap-4  justify-center">
        <div
          className={`max-w-[1024px]  w-full h-[400px] ${
            chartFlag ? "block" : "hidden"
          } md:min-h-[600px] relative `}
        >
          <TradingViewWidget />
        </div>
        <div className="w-full max-w-[400px] ">
          <SwapWidget />
        </div>
      </div>
      <div className="lg:hidden w-full flex justify-center">
        {chartFlag ? (
          <div className="max-w-[1024px] w-full h-[400px] md:min-h-[600px] relative">
            <TradingViewWidget />
          </div>
        ) : (
          <div className="w-full max-w-[400px]">
            <SwapWidget />
          </div>
        )}
      </div>
    </div>
  );
};
