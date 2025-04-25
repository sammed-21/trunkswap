import { usePoolState } from "@/state/poolStore";
import React from "react";
import { PoolRow } from "./PoolRow";

type Props = {};

export const PoolList = () => {
  const { poolData } = usePoolState(); // assumes array<PoolDetails>

  if (!poolData?.length)
    return <p className="text-center py-10">No pools found.</p>;

  return (
    <div className="space-y-2">
      {poolData.map((p) => (
        <PoolRow key={p.pairAddress} pool={p} />
      ))}
    </div>
  );
};
