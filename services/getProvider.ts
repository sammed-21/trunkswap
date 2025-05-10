import { fallbackUrls } from "@/lib/constants";
import { JsonRpcProvider } from "ethers";

export const getProvider = (chainId: number = 421614) => {
    const rpcUrl = fallbackUrls[chainId] || fallbackUrls[421614];
  
    return new JsonRpcProvider(rpcUrl);
  };
  