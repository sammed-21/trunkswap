import { fallbackUrls } from "@/lib/constants";
import { JsonRpcProvider } from "ethers";

export const getProvider = (chainId: number = 31337) => {
  const rpcUrl =
    fallbackUrls[chainId] ||
    fallbackUrls[Number(process.env.NEXT_PUBLIC_TEST_CHAINID!)];

  return new JsonRpcProvider(rpcUrl);
};
