import { ERC20_ABI } from "@/abi/ERC20ABI";
import { ethers } from "ethers";
// standard ERC20 ABI

export async function fetchTokenBalance(
  tokenAddress: string,
  userAddress: string,
  provider: any,
  decimals: number
): Promise<string> {
  try {
    if (tokenAddress === ethers.ZeroAddress) {
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
