"use client";
import React, { useEffect } from "react";
import { SwapWidget } from "./SwapWidget";

import { TradingViewWidget } from "@/components/Chart/TradingViewWidget";
import { useSwapState } from "@/state/swapStore";
import { useRouter, useSearchParams } from "next/navigation";
type Props = {};

export const SwapComponent = (props: Props) => {
  const { chartFlag, token0, token1 } = useSwapState();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currencyIn = searchParams.get("currencyIn");
    const currencyOut = searchParams.get("currencyOut");

    // If no tokens selected in URL, set default
    if (!currencyIn || !currencyOut) {
      const defaultIn = token0.toUpperCase();
      const defaultOut = token1.toUpperCase();

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("currencyIn", defaultIn);
      newParams.set("currencyOut", defaultOut);

      router.replace(`/swap?${newParams.toString()}`);
    }
  }, [searchParams, router]);

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
        <div className="w-full max-w-[478px] ">
          <SwapWidget />
        </div>
      </div>
      <div className="lg:hidden w-full flex justify-center">
        {chartFlag ? (
          <div className="max-w-[1024px] w-full h-[400px] md:min-h-[600px] relative">
            <TradingViewWidget />
          </div>
        ) : (
          <div className="w-full max-w-[478px]">
            <SwapWidget />
          </div>
        )}
      </div>
    </div>
  );
};
