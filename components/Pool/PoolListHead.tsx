import { usePoolState } from "@/state/poolStore";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { formatUSD } from "@/services/priceFeed";
import { useLiqudityState } from "@/state/liquidityStore";

export const PoolListHead = () => {
  const { totalPool, isLoadingPools, totalTvl } = useLiqudityState();

  return (
    <div className="h-[250px] rounded-lg flex bg-forground  justify-start   items-center w-full border-border">
      <div className="w-full  md:flex-row flex-col  relative flex justify-between  p-5 items-start">
        <div className="max-md:mb-6">
          <h1 className="text-4xl">Provide Liquidity</h1>
          <p>Provide Liqudity to the pools and earn fee as a reward</p>
        </div>

        <div className="grid grid-cols-2 rounded-lg !bg-accent gap-5 p-5">
          <span className="flex col-span-1 flex-col items-start justify-start text-start">
            <span className="text-subtitle text-base font-semibold">Pools</span>
            {isLoadingPools ? (
              <Skeleton className="w-[100px] h-[20px] rounded-lg" />
            ) : (
              <span className="text-title text-3xl font-bols">
                {totalPool.toString()}
              </span>
            )}{" "}
          </span>
          <span className="flex col-span-1  flex-col items-start justify-start text-start">
            <span className="text-subtitle   text-base font-semibold">TVL</span>
            {isLoadingPools ? (
              <Skeleton className="w-[100px] h-[20px] rounded-lg" />
            ) : (
              <span className="text-title text-3xl font-bols">
                {formatUSD(totalTvl)}
              </span>
            )}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};
