import { ERC20_ABI } from "@/abi/ERC20ABI";
import { isWETHAddress } from "@/lib/constants";
import { ethers } from "ethers";
// standard ERC20 ABI

export async function fetchTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: any,
  decimals: number,
  chainId: number
): Promise<string> {
  try {
    if (
      tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ||
      isWETHAddress(tokenAddress, chainId!)
    ) {
      // Native token (ETH, etc.)
      const balance = await provider.getBalance(userAddress);
      return ethers.formatUnits(balance, decimals);
    } else {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      return ethers.formatUnits(balance, decimals);
    }
  } catch (e) {
    console.error("Balance error", e);
    return "0";
  }
}
