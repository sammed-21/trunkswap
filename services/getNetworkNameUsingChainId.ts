import { defaultChainId } from "@/lib/constants";

const obj: Record<number, string> = {
  1: "ethereum",
  42161: "arbitrum",
  421614: "arbitrum_sepolia",
  11155111: "sepolia",
  31337: "localhost",
};

export const getNetworkNameUsingChainId = (
  chainId: number = defaultChainId
) => {
  return obj[chainId];
};
