import { usePoolState } from "@/state/poolStore";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { formatUSD } from "@/services/priceFeed";

export const PoolListHead = () => {
  const { totalPool, isLoading, totalTvl } = usePoolState();
  return (
    <div className="h-[250px]  flex bg-forground  justify-start   items-center w-full border-border">
      <div className="max-w-[30%] w-full container"></div>
      <div className="w-[68%] relative flex justify-between  p-5 items-start">
        <div className="">
          <h1 className="text-4xl">Provide Liquidity</h1>
          <p>Provide Liqudity to the pools and earn fee as a reward</p>
        </div>

        <div className="grid grid-cols-2 gap-5 p-5">
          <span className="flex col-span-1 flex-col items-start justify-start text-start">
            <span className="text-subtitle text-base font-semibold">Pools</span>
            {isLoading ? (
              <Skeleton className="w-[100px] h-[20px] rounded-none" />
            ) : (
              <span className="text-white text-3xl font-bols">{totalPool}</span>
            )}{" "}
          </span>
          <span className="flex col-span-1 flex-col items-start justify-start text-start">
            <span className="text-subtitle text-base font-semibold">TVL</span>
            {isLoading ? (
              <Skeleton className="w-[100px] h-[20px] rounded-none" />
            ) : (
              <span className="text-white text-3xl font-bols">
                {formatUSD(totalTvl)}
              </span>
            )}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};
