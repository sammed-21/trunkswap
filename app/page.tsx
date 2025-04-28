"use client";

import { useGetSignerAndProvider } from "@/hooks/useGetSIgnerAndProvider";
import { getNetworkNameUsingChainId } from "@/services/getNetworkNameUsingChainId";
import { useAccountState } from "@/state/accountStore";
import { useCall, useChainId } from "wagmi";

export default function Home() {
  const chainId = useChainId();
  const provider = useAccountState();

  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      Welcome to the 0xDex
    </div>
  );
}
