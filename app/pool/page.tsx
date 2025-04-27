"use client";
import { ERC20Abi } from "@/abi/ERC20ABI";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { PAIR_ABI } from "@/abi/PAIR_ABI";
import { addressess } from "@/address";
import { Navbar } from "@/components/Navbar/Navbar";
import { PoolPositionsList } from "@/components/Pool/PoolDataDisply";
import { PoolList } from "@/components/Pool/PoolLIst";
import { PriceChart } from "@/components/PriceChart/PriceChart";
import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
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
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-col  items-start justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <PoolPositionsList />
      </div>

      <div>
        <PoolList />
      </div>
    </div>
  );
}
