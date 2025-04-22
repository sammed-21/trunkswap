"use client";
import { ERC20Abi } from "@/abi/ERC20ABI";
import { addressess } from "@/address";
import { Navbar } from "@/components/Navbar/Navbar";
import { PriceChart } from "@/components/PriceChart/PriceChart";
import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";
import { getNetwork } from "@/services/getNetworkNameUsingChainId";
import { getProvider } from "@/services/walletEvents";
import { useAccountState } from "@/state/accountStore";

import { config } from "@/wagmi/config";
import { Contract, ethers, formatEther } from "ethers";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { multicall } from "viem/actions";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
} from "wagmi";

export default function Home() {
  const { address } = useAccount();
  const chainId = useChainId();

  const [balance, setBalance] = useState<string | null>(null);

  const { provider, viemClient } = useAccountState();
  console.log({ viemClient, provider, chainId });
  console.log(chainId, getNetwork(chainId));
  console.log(addressess[getNetwork(chainId)].STX_ADDRESS);
  console.log(addressess[getNetwork(chainId)].RSTX_ADDRESS);
  const stxcontract = {
    address: addressess[getNetwork(chainId)].STX_ADDRESS,
    abi: ERC20Abi,
  } as const;
  const rstxcontract = {
    address: addressess[getNetwork(chainId)].RSTX_ADDRESS,
    abi: ERC20Abi,
  } as const;
  const bala = useCallback(async () => {
    console.log(provider);
    if (provider) {
      // const ballanc = await provider.getBalance(address);
      const chi = await provider.getNetwork();
      console.log(chi);
      // console.log({ ballanc });
      const stx = new Contract(stxcontract.address, ERC20Abi, provider);
      const dec = await stx.decimals();
      console.log(dec);
    }
  }, [chainId]);

  useEffect(() => {
    const testRes = async () => {
      let res;
      try {
        res = await viemClient.multicall({
          contracts: [
            {
              ...stxcontract,
              functionName: "name",
            },

            {
              ...rstxcontract,
              functionName: "decimals",
            },
            {
              ...rstxcontract,
              functionName: "symbol",
            },
            {
              ...rstxcontract,
              functionName: "name",
            },

            {
              ...stxcontract,
              functionName: "decimals",
            },
            {
              ...stxcontract,
              functionName: "symbol",
            },
          ],
        });
      } catch (error) {}
      console.log({ res });
      //   setBalance(res);
    };

    testRes();
    bala();
    console.log(provider);
  }, [chainId]);
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <PriceChart />
      <SwapWidget />
    </div>
  );
}
