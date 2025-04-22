"use client";
import { ERC20Abi } from "@/abi/ERC20ABI";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { addressess } from "@/address";
import { Navbar } from "@/components/Navbar/Navbar";
import { PriceChart } from "@/components/PriceChart/PriceChart";
import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";
import { getNetwork } from "@/services/getNetworkNameUsingChainId";
import { useAccountState } from "@/state/accountStore";
// import { useGetSignerAndProvider } from "@/hooks/useGetSIgnerAndProvider";
import { config } from "@/wagmi/config";
import { ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { multicall } from "viem/actions";
import { useAccount, useChainId, usePublicClient } from "wagmi";

export default function Pool() {
  const chainId = useChainId();
  const { provider } = useAccountState();
  const [pools, setPools] = useState<any>([]);
  const factoryContract = new ethers.Contract(
    addressess[getNetwork(chainId)].FACTORY_ADDRESS,
    FACTORY_ABI,
    provider
  );
  useEffect(() => {
    async function poolData() {
      const pairAddresses = await getAllPairs(factoryContract);
      const poolDetails = await Promise.all(
        pairAddresses.map(
          (pairAddress) => getPairDetails(pairAddress, provider) // ✅ passing provider explicitly
        )
      );
      console.log({ poolDetails });
      setPools(poolDetails);
    }
    poolData();
  }, [chainId]);
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      this isthe pool
      <div className="flex flex-col items-center justify-center gap-3">
        {pools.map((pool: any, index: any) => (
          <div key={index} className="">
            {pool.token0.symbol} / {pool.token1.symbol}
            {pool.reserve}
            {pool.totalSupply}
          </div>
        ))}
      </div>
    </div>
  );
}
async function getAllPairs(factoryContract: any) {
  let allPairsLength = await factoryContract.allPairsLength();
  console.log({ allPairsLength });
  const pairAddresses = [];

  for (let i = 0; i < 10; i++) {
    const pairAddress = await factoryContract.allPairs(i);
    if (pairAddress == null) {
      return;
    }
    pairAddresses.push(pairAddress);
  }

  return pairAddresses;
}

async function getPairDetails(pairAddress: any, provider: any) {
  const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);

  const token0Address = await pairContract.token0();
  const token1Address = await pairContract.token1();
  const reserves = await pairContract.getReserves();
  const totalSupply = await pairContract.totalSupply();

  const token0Contract = new ethers.Contract(token0Address, ERC20Abi, provider);
  const token1Contract = new ethers.Contract(token1Address, ERC20Abi, provider);

  const token0Symbol = await token0Contract.symbol();
  const token1Symbol = await token1Contract.symbol();

  return {
    pairAddress,
    token0: {
      address: token0Address,
      symbol: token0Symbol,
    },
    token1: {
      address: token1Address,
      symbol: token1Symbol,
    },
    reserves,
    totalSupply,
  };
}
