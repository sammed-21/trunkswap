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
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
interface RowProps {
  pool: Pool;
  handleAddLiqudity: (pool: Pool) => void;
  setDefaultLiquidityTag: (addRemoveTag: string) => void;
}

export const PoolRow = ({
  pool,
  setDefaultLiquidityTag,
  handleAddLiqudity,
}: RowProps) => {
  const router = useRouter();

  return (
    <div>
      <div
        // onClick={() => {router.push(`/pool/${pool.pairAddress!}}`)}
        className="grid grid-cols-4 md:grid-cols-6 w-full items-center justify-between px-4 hover:bg-hover   py-3    transition p-4"
      >
        <div className="flex col-span-1  lg:col-span-2 items-center gap-5">
          <div className="flex    flex-col text-start">
            <span className="text-base flex flex-wrap space-x-3 items-center text-textprimary  max-lg:justify-start">
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

        <div className="lg:flex hidden gap-3 pr-4 items-center justify-center">
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
                `/swap?currencyIn=${pool.token0.symbol}&currencyOut=${pool.token1.symbol}`
              );
            }}
            variant={"primary"}
          >
            Swap
          </Button>
          <Button
            onClick={() => {
              setDefaultLiquidityTag("Add"), handleAddLiqudity(pool);
            }}
            variant={"primary"}
          >
            <IoIosAddCircleOutline size={20} />
          </Button>
          <Button
            onClick={() => {
              setDefaultLiquidityTag("Remove"), handleAddLiqudity(pool);
            }}
            variant={"primary"}
          >
            <FiMinusCircle size={20} />
          </Button>
        </div>
        {/* <span className="  flex items-center justify-center col-span-1  md:flex">
        &nbsp; {pool.totalSupply}
      </span> */}
      </div>
      <div className="py-[2px] lg:hidden flex my-2 bg-accent w-full "></div>
      <div className="lg:hidden px-2 flex gap-3 my-2 pr-4 items-center justify-center">
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
        <Button
          onClick={() => {
            setDefaultLiquidityTag("Add"), handleAddLiqudity(pool);
          }}
          className="flex gap-3 items-center"
          variant={"primary"}
        >
          <IoIosAddCircleOutline size={20} />
          Add Liquidity
        </Button>
        <Button
          onClick={() => {
            setDefaultLiquidityTag("Remove"), handleAddLiqudity(pool);
          }}
          className="flex gap-3 items-center"
          variant={"primary"}
        >
          <FiMinusCircle size={20} />
          Remove Liquidity
        </Button>
      </div>
    </div>
  );
};

export const PoolRowHeading = () => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 w-full items-center  justify-between px-4      hover:bg-secondary  py-4 dark:hover:bg-secondary transition p-4">
      <div className="flex col-span-1 lg:col-span-2 items-center   gap-2">
        <span className=" columns-1 text-base font-semibold ">Pool</span>
      </div>

      <span className="col-start-2 lg:col-start-3 col-span-1 w-full text-base font-semibold flex items-center justify-center">
        TVL
      </span>
      <span className="col-start-3 lg:col-start-4 col-span-1 w-full  text-base font-semibold flex items-center justify-center">
        Token A
      </span>
      <span className="col-start-4 lg:col-start-5 col-span-1 col-end-5 text-base font-semibold items-center flex justify-center w-full ">
        Token B
      </span>
    </div>
  );
};
