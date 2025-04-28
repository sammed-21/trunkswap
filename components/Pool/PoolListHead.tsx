import { usePoolState } from "@/state/poolStore";
import { formatEther } from "ethers";
import React from "react";
import { Skeleton } from "../ui/skeleton";

export const PoolListHead = () => {
  const { totalPool, isLoading } = usePoolState();
  return (
    <div className="h-[250px] flex bg-primary  justify-center   items-center w-full border-border">
      <div className="max-w-[80%] flex justify-between w-full items-center">
        <div className="">
          <h1 className="text-4xl">Provide Liquidity</h1>
          <p>Provide Liqudity to the pools and earn fee as a reward</p>
        </div>

        {isLoading ? (
          <Skeleton className="w-[100px] h-[20px] rounded-none" />
        ) : (
          <div className="flex flex-col items-start justify-start text-start">
            <span className="text-textpriamry text-xl font-semibold">
              Pools
            </span>
            <span className="text-white text-2xl font-bols">{totalPool}</span>
          </div>
        )}
      </div>
    </div>
  );
};
