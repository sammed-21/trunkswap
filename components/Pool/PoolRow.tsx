// components/pool/PoolRow.tsx
"use client";
import { formatDigits, shortenAddress } from "@/lib/utils";
import { formatUSD } from "@/services/priceFeed";
import { Pool } from "@/state/liquidityStore";
import { PoolDetails } from "@/state/poolStore";
import { parseEther } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { formatEther } from "viem";
import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";

interface RowProps {
  pool: Pool;
  handleAddLiqudity: (pool: Pool) => void;
}

export const PoolRow = ({
  pool,

  handleAddLiqudity,
}: RowProps) => {
  const router = useRouter();
  return (
    <div
      onClick={() => handleAddLiqudity(pool)}
      // onClick={() => {router.push(`/pool/${pool.pairAddress!}}`)}
      className="grid grid-cols-5 md:grid-cols-6 w-full items-center justify-between px-4 hover:bg-hover   py-3    transition p-4"
    >
      <div className="flex col-span-1  md:col-span-2 items-center gap-5">
        <div className="flex    flex-col text-start">
          <span className="text-base flex flex-wrap space-x-3 items-center text-textpriamry  max-md:justify-start">
            <Image
              src={`/tokens/${pool.token0.symbol.toLowerCase()}.svg`}
              className="relative mr-4 !m-0 h-10 w-10 z-0 rounded-full   object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
              width={20}
              height={20}
              alt="image"
            />
            <span className="text-base font-semibold ">
              {pool.token0.symbol}{" "}
            </span>
            <span>/</span>
            <Image
              src={`/tokens/${pool.token1.symbol.toLowerCase()}.svg`}
              className="relative h-10 w-10 z-10 rounded-full  object-cover object-top  transition duration-500 group-hover:z-30 group-hover:scale-105"
              width={20}
              height={20}
              alt="image"
            />{" "}
            <span className="text-base font-semibold ">
              {pool.token1.symbol}
            </span>
          </span>
        </div>
      </div>
      <div className="col-span-1 text-base font-semibold flex justify-center items-center">
        {formatUSD(pool.tvl)}
      </div>

      <div className="flex gap-6 justify-around    text-lg col-span-2">
        <span className=" text-base font-semibold">
          {formatDigits(pool.reserves0)} {pool.token0.symbol}
        </span>
        <span className=" text-base font-semibold">
          {formatDigits(pool.reserves1)} {pool.token1.symbol}
        </span>
      </div>
      <div className="flex gap-3 pr-4 items-center justify-center">
        {/* <Button
          onClick={(e) => {
            e.stopPropagation();
            
          }}
          variant={"primary"}
        >
          +
        </Button>
        <Button variant={"primary"}>-</Button> */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            router.push(
              `/swap?currencyIn=${pool.token0.address}&currencyOut=${pool.token1.address}`
            );
          }}
          variant={"primary"}
        >
          Swap
        </Button>
      </div>
      {/* <span className="  flex items-center justify-center col-span-1  md:flex">
        &nbsp; {pool.totalSupply}
      </span> */}
    </div>
  );
};

export const PoolRowHeading = () => {
  return (
    <div className="grid grid-cols-5 md:grid-cols-6 w-full items-center  justify-between px-4      hover:bg-secondary  py-4 dark:hover:bg-secondary transition p-4">
      <div className="flex col-span-1 md:col-span-2 items-center   gap-2">
        <span className=" columns-1 text-base font-semibold ">Pool</span>
      </div>

      <span className="col-start-2 md:col-start-3 col-span-1 w-full text-base font-semibold flex items-center justify-center">
        TVL
      </span>
      <span className="col-start-3 md:col-start-4 col-span-1 w-full  text-base font-semibold flex items-center justify-center">
        Token A
      </span>
      <span className="col-start-4 md:col-start-5 col-span-1 col-end-5 text-base font-semibold items-center flex justify-center w-full ">
        Token B
      </span>
    </div>
  );
};
