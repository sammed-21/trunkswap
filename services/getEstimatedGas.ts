import { ethers, formatEther } from "ethers";

export const getGasEstimation = async (tx3: any, provider: any) => {
  // If you want estimated fee in wei:

  let estimateGas = await provider.estimateGas({
    tx3,
  });
  let gasPrice = await provider.getFeeData(); // returns BigInt in wei

  let estimatedFee = estimateGas * gasPrice.gasPrice;

  const formatedEstimatedFee = formatEther(estimatedFee);
  return {
    estimatedFee,
    formatedEstimatedFee,
  };
};
