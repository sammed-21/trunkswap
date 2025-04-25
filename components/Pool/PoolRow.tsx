// components/pool/PoolRow.tsx
"use client";
import { PoolDetails } from "@/state/poolStore";
import Link from "next/link";

interface RowProps {
  pool: PoolDetails;
}

export const PoolRow = ({ pool }: RowProps) => {
  const [reserve0, reserve1] = pool.reserves;

  return (
    <Link
      href={`/pool/${pool.pairAddress}`}
      className="flex items-center justify-between px-4 border-[1px] rounded-md py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition p-4"
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {pool.token0.symbol}/{pool.token1.symbol}4
        </span>
        <span className="text-xs text-zinc-500">
          {pool.pairAddress.slice(0, 6)}…{pool.pairAddress.slice(-4)}
        </span>
      </div>

      <div className="flex gap-6 text-sm">
        <span>
          {Number(reserve0) / 1e18} {pool.token0.symbol}
        </span>
        <span>
          {Number(reserve1) / 1e18} {pool.token1.symbol}
        </span>
        <span className="hidden md:inline">
          $&nbsp; {Number(pool.totalSupply) / 1e18}
        </span>
      </div>
    </Link>
  );
};
