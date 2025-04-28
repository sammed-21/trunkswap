// components/pool/PoolRow.tsx
"use client";
import { formatDigits } from "@/lib/utils";
import { PoolDetails } from "@/state/poolStore";
import Link from "next/link";

interface RowProps {
  pool: PoolDetails;
}

export const PoolRow = ({ pool }: RowProps) => {
  console.log({ pool });

  return (
    <Link
      href={`/pool/${pool.pairAddress}`}
      className="grid grid-cols-5 w-full items-center justify-between px-4 bg-primary border-[1px] border-border  py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition p-4"
    >
      <div className="flex   col-span-2 items-center gap-2">
        <span className="font-semibold text-2xl">
          {pool.token0.symbol} / {pool.token1.symbol}
        </span>
        {/* <span className="text-xs text-zinc-500">
          {pool.pairAddress.slice(0, )}…{pool.pairAddress.slice(-4)}
        </span> */}
      </div>

      <div className="flex gap-6 justify-around   text-lg col-span-2">
        <span>
          {formatDigits(pool.reserve0)} {pool.token0.symbol}
        </span>
        <span>
          {formatDigits(pool.reserve1)} {pool.token1.symbol}
        </span>
      </div>
      <span className="  flex items-center justify-center col-span-1  md:flex">
        &nbsp; {Number(pool.totalSupply) / 1e18}
      </span>
    </Link>
  );
};

export const PoolRowHeading = () => {
  return (
    <div className="grid grid-cols-5 w-full items-center  justify-between px-4 border-[1px] border-border  py-6 bg-primary hover:bg-secondary dark:hover:bg-secondary transition p-4">
      <div className="flex col-span-2 items-center   gap-2">
        <span className="font-medium columns-1 ">Pool</span>
      </div>

      <div className="  gap-6    flex justify-around col-span-2   text-sm">
        <span className="col-start-3 w-fit ">Token A</span>
        <span className="col-start-4 col-end-5 items-center flex justify-center w-fit ">
          Token B
        </span>
      </div>
      <span className="flex col-span-1 items-center justify-center">
        Total Supply
      </span>
    </div>
  );
};
