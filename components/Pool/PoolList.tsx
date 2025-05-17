"use client";
import { usePoolState } from "@/state/poolStore";
import React, { useEffect, useState } from "react";
import { PoolRow, PoolRowHeading } from "./PoolRow";
import { Button } from "../ui/Button";
import { IoMdAdd } from "react-icons/io";
import { Pool, useLiquidityStore } from "@/state/liquidityStore";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { useAccountState } from "@/state/accountStore";
import { LoadingScreen } from "../Common/LoadingScreen";

export const PoolList = () => {
  // const { pools, isLoading } = usePoolState();
  const { provider } = useAccountState();
  const router = useRouter();
  const {
    pools,
    fetchPools,
    isLoadingPools,
    error: poolsError,
    setSelectedPool,
  } = useLiquidityStore();
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!pools?.length)
    return (
      <>
        <PoolRowHeading />
        <div className="flex flex-col gap-2">
          {[0, 1].map((p, key) => (
            <div key={key}>
              <Skeleton className="h-[60px] w-full bg-forground" />
            </div>
          ))}
        </div>
      </>
    );

  const filteredTokens = pools.filter(
    (pools: Pool) =>
      pools.token0.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pools.token1.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create new pair
  const handleAddLiqudity = (pool: Pool) => {
    setSelectedPool(pool);
    router.push(`/pool/${pool.pairAddress!}`);
    // router.push(
    //   `/add-liquidity/token0=${pool?.token0?.address}/token1=${pool?.token1?.address}`
    //   // `/add-liquidity/token0=${pool?.token0?.address}/token1=${pool?.token1?.address}`
    // );
  };

  return (
    <div className="space-y-2 overflow-x-auto w-full">
      {isLoadingPools ? (
        <div className="w-full h-full flex items-center justify-center">
          <LoadingScreen />
        </div>
      ) : (
        <div className="w-full ">
          <div className="my-1   justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pair"
              className="w-full  max-w-[300px] p-1  bg-forground border-border border-[1px] text-white rounded-none"
            />
            {/* <div>
              <Button
                className="text-lg font-medium"
                size={"sm"}
                variant={"white"}
              >
                <IoMdAdd /> Create Pair
              </Button>
            </div> */}
          </div>
          <div className="flex border-[1px] border-border   bg-forground overflow-x-auto flex-col w-full ">
            <div className="border-b-[1px] min-w-[800px] w-full border-border">
              <PoolRowHeading />
            </div>
            {filteredTokens.length === 0 ? (
              <p className="text-center py-10">No matching pools found.</p>
            ) : (
              filteredTokens.map((p, key) => (
                <div
                  key={key}
                  className="border-b-[1px]  min-w-[800px] w-full  border-border  "
                >
                  <PoolRow
                    key={p.pairAddress}
                    pool={p}
                    handleAddLiqudity={handleAddLiqudity}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
