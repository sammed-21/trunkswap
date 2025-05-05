import { ethers } from "ethers";

export async function fetchTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  provider: any,
  decimals: number = 18
): Promise<string> {
  // For native ETH
  if (tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    const balance = await provider.request({
      method: "eth_getBalance",
      params: [walletAddress, "latest"],
    });
    const formattedBalance = formatBalance(balance, decimals);
    return formattedBalance;
  }

  // For ERC20 tokens
  try {
    // Minimal ERC20 ABI for balanceOf function
    const minABI = [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
      },
    ];

    // Create contract instance

    const contract = new ethers.Contract(tokenAddress, minABI, provider);

    // Get balance
    const balance = await contract.balanceOf(walletAddress);
    const formattedBalance = formatBalance(balance.toString(), decimals);
    return formattedBalance;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return "0";
  }
}

// Helper function to format balance
export function formatBalance(balance: string, decimals: number): string {
  if (!balance) return "0";

  const formatted = ethers.formatUnits(balance, decimals);

  // Format to 4 decimal places
  const num = parseFloat(formatted);
  return num.toFixed(4);
}

export function convertTokenAmount(
  amount: number,
  fromSymbol: string,
  toSymbol: string,
  prices: Record<string, number>
): number {
  const fromPrice = prices[`${fromSymbol}_USD`];
  const toPrice = prices[`${toSymbol}_USD`];
  if (!fromPrice || !toPrice)
    throw new Error("Invalid token symbols or prices missing");

  return (amount * fromPrice) / toPrice;
}
