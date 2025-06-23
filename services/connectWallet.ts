import { ERC20Abi } from "@/abi/ERC20ABI";
import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const { chainId } = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(chainId),
  };
}

export async function getTokenBalance(
  tokenAddress: string,
  accountAddress: string,
  provider: ethers.Provider
) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, provider);
    const balance = await tokenContract.balanceOf(accountAddress);
    return balance.toString();
  } catch (error) {
    console.error("Failed to get token balance:", error);
    throw error;
  }
}
