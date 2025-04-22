const obj: Record<number, string> = {
  1: "ethereum",
  42161: "arbitrum",
  421614: "arbitrum_sepolia",
  11155111: "sepolia",
};

export const getNetwork = (chainId: number = 421614) => {
  console.log(chainId);
  return obj[chainId];
};
