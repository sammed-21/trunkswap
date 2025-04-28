"use client";
import { usePoolState } from "@/state/poolStore";
import React, { useState } from "react";
import { PoolRow, PoolRowHeading } from "./PoolRow";
import { Button } from "../ui/Button";

type Props = {};

export const PoolList = () => {
  const { poolData, isLoading } = usePoolState();
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!poolData?.length)
    return (
      <>
        <PoolRowHeading />
        <p className="text-center py-10">No pools found.</p>
      </>
    );

  const filteredTokens = poolData.filter(
    (poolData) =>
      poolData.token0.symbol
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      poolData.token1.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2 w-full">
      {isLoading ? (
        <div>this page is loading</div>
      ) : (
        <div className="w-full ">
          <div className="mb-4 flex justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pair"
              className="w-full  max-w-[500px] p-2  bg-secondary text-white rounded-none"
            />
            <div>
              <Button className=" " size={"sm"} variant={"white"}>
                Create Pair
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
                  <PoolRow key={p.pairAddress} pool={p} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
