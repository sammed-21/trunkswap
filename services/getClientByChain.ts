import { arbitrumSepoliapublicClient, sepoliaClient } from "@/wagmi/config";
import { arbitrumSepolia, sepolia } from "viem/chains";

export const getClientByChain = (chainId: number) => {
  switch (chainId) {
    case arbitrumSepolia.id:
      return arbitrumSepoliapublicClient;
    case sepolia.id:
      return sepoliaClient;
    default:
      throw new Error("Unsupported chain");
  }
};
