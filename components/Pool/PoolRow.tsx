// components/pool/PoolRow.tsx
"use client";
import { formatDigits, shortenAddress } from "@/lib/utils";
import { formatUSD } from "@/services/priceFeed";
import { PoolDetails } from "@/state/poolStore";
import Image from "next/image";
import Link from "next/link";

interface RowProps {
  pool: PoolDetails;
}

export const PoolRow = ({ pool }: RowProps) => {
  return (
    <div
      // href={`/pool/${pool.pairAddress}`}
      className="grid grid-cols-6 w-full items-center justify-between px-4 bg-forground  border-[1px] border-border  py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition p-4"
    >
      <div className="flex   col-span-2 items-center gap-5">
        <span className="font-medium flex   relative w-[60px]  text-xl  ">
          <Image
            src={`/tokens/${pool.token0.symbol.toLowerCase()}.svg`}
            className="relative mr-4 !m-0 h-10 w-10 z-0 rounded-full   object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
            width={20}
            height={20}
            alt="image"
          />
          <div className="z-40 absolute left-1/2 w-10 h-10 right-0 ">
            <Image
              src={`/tokens/${pool.token1.symbol.toLowerCase()}.svg`}
              className="relative   h-10 w-10 z-10 rounded-full  object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
              width={20}
              height={20}
              alt="image"
            />
          </div>
        </span>
        <div className="flex    flex-col text-start">
          <span className="text-base text-textpriamry text-">
            {pool.token0.symbol} / {pool.token1.symbol}
          </span>
          <span className="text-sm text-subtitle">
            {shortenAddress(pool.pairAddress)}
          </span>
        </div>
        {/* <span className="text-xs text-zinc-500">
          {pool.pairAddress.slice(0, )}…{pool.pairAddress.slice(-4)}
        </span> */}
      </div>
      <div className="col-span-1 flex justify-center items-center">
        {formatUSD(pool.tvl)}
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
    </div>
  );
};

export const PoolRowHeading = () => {
  return (
    <div className="grid grid-cols-6 w-full items-center  justify-between px-4 border-[1px] border-border  py-6 bg-forground hover:bg-secondary dark:hover:bg-secondary transition p-4">
      <div className="flex col-span-2 items-center   gap-2">
        <span className="font-medium columns-1 ">Pool</span>
      </div>

      <span className="col-start-3 col-span-1 w-full  flex items-center justify-center">
        TVL
      </span>
      <span className="col-start-4 col-span-1 w-full  flex items-center justify-center">
        Token A
      </span>
      <span className="col-start-5 col-span-1 col-end-5 items-center flex justify-center w-full ">
        Token B
      </span>

      <span className="flex col-span-1 items-center justify-center">
        Total Supply
      </span>
    </div>
  );
};
