"use client";
import React, { useCallback, useMemo, useState } from "react";
import { PoolRow, PoolRowHeading } from "./PoolRow";
import { Pool, useLiquidityStore } from "@/state/liquidityStore";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "../Common/LoadingScreen";

export const PoolList = () => {
  const router = useRouter();
  const {
    pools,
    isLoadingPools,
    setSelectedPool,
    defaultLiquidityTag,
    setDefaultLiquidityTag,
  } = useLiquidityStore();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTokens = useMemo(() => {
    pools.filter(
      (pools: Pool) =>
        pools.token0.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pools.token1.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return pools;
  }, [pools]);

  // Handle create new pair
  const handleAddLiqudity = (pool: Pool) => {
    setSelectedPool(pool);

    router.push(`/pool/${pool.pairAddress!}`);
  };
  return (
    <div className="space-y-2 overflow-x-auto w-full">
      {/* {isLoadingPools ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingScreen />
        </div>
      ) : ( */}
      <div className="w-full ">
        {/* <div className="my-1   justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pair"
            className="w-full  max-w-[300px] p-1  bg-forground border-border border-[1px] text-white rounded-lg"
          />
        </div> */}
        <div className="flex border-[1px] border-border rounded-lg  bg-forground overflow-x-auto flex-col w-full ">
          <div className="border-b-[1px]  w-full border-border">
            <PoolRowHeading />
          </div>
          {filteredTokens.length === 0 ? (
            <p className="text-center py-10">No pools found.</p>
          ) : (
            filteredTokens.map((p, key) => (
              <div
                key={key}
                className="border-b-[1px] rounded-lg   w-full  border-border  "
              >
                <PoolRow
                  key={p.pairAddress}
                  pool={p}
                  handleAddLiqudity={handleAddLiqudity}
                  setDefaultLiquidityTag={setDefaultLiquidityTag}
                />
              </div>
            ))
          )}
        </div>
      </div>
      {/* )} */}
    </div>
  );
};
