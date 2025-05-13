"use client";
import { usePoolState } from "@/state/poolStore";
import React, { useState } from "react";
import { PoolRow, PoolRowHeading } from "./PoolRow";
import { Button } from "../ui/Button";
import { IoMdAdd } from "react-icons/io";
import { Pool, useLiquidityStore } from "@/state/liquidityStore";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";

export const PoolList = () => {
  // const { pools, isLoading } = usePoolState();
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

  const handlePoolSelect = (pool: Pool) => {
    router.push(`/pool/${pool?.pairAddress}`);
  };
  // Handle create new pair
  const handleAddLiqudity = (pool: Pool) => {
    setSelectedPool(pool);
    router.push(
      `/add-liquidity/token0=${pool?.token0?.address}/token1=${pool?.token1?.address}`
      // `/add-liquidity/token0=${pool?.token0?.address}/token1=${pool?.token1?.address}`
    );
  };

  return (
    <div className="space-y-2 w-full">
      {isLoadingPools ? (
        <div>this page is loading</div>
      ) : (
        <div className="w-full ">
          <div className="mb-4  hidden justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pair"
              className="w-full  max-w-[500px] p-2  bg-forground border-border border-[1px] text-white rounded-none"
            />
            <div>
              <Button
                className="text-lg font-medium"
                size={"sm"}
                variant={"white"}
              >
                <IoMdAdd /> Create Pair
              </Button>
            </div>
          </div>
          <div className="flex flex-col w-full ">
            <PoolRowHeading />

            {filteredTokens.length === 0 ? (
              <p className="text-center py-10">No matching pools found.</p>
            ) : (
              filteredTokens.map((p, key) => (
                <div key={key}>
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
