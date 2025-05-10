import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi"; // or your preferred wallet lib
import { useAccountStore } from "@/state/accountStore";
import { getProvider } from "@/services/getProvider";

export function useETHBalance() {
  const { address } = useAccount();
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const { chainId } = useAccount();
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address || !chainId || typeof window === "undefined") return;
      const provider = getProvider(chainId);
      const balance = await provider.getBalance(address);
      const formatted = ethers.formatEther(balance);
      setEthBalance(Number(formatted).toFixed(4)); // limit to 4 decimals
    };

    fetchBalance();

    // Optionally refetch every 15 seconds
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [address]);

  return ethBalance;
}
