import { addressess } from "@/address";
import { ethers } from "ethers";

import { getNetworkNameUsingChainId } from "./getNetworkNameUsingChainId";
import { ROUTER_ABI } from "@/abi/ROUTER_ABI";
import { FACTORY_ABI } from "@/abi/FACTORY_ABI";
import { ERC20_ABI } from "@/abi/ERC20ABI";

export const getRouterContract = (chainId: number, provider: any) => {
  const contractAddress =
    addressess[getNetworkNameUsingChainId(chainId)].ROUTER_ADDRESS;

  return new ethers.Contract(contractAddress, ROUTER_ABI, provider);
};

export const getFactoryContract = (chainId: number, provider: any) => {
  const contractAddress =
    addressess[getNetworkNameUsingChainId(chainId)].FACTORY_ADDRESS;

  return new ethers.Contract(contractAddress, FACTORY_ABI, provider);
};

export const getErc20Contract = (address: string, provider: any) => {
  return new ethers.Contract(address, ERC20_ABI, provider);
};
