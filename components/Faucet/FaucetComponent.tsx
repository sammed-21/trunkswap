"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "ethers";
import toast from "react-hot-toast";
import { useFaucetStore } from "@/state/faucetStore";
import { useAccountState } from "@/state/accountStore";
import { getErc20Contract, getFaucetContract } from "@/services/getContracts";
import { SupportedToken, TOKENS } from "@/address";
import Image from "next/image";
import ConnectWallet from "../Common/ConnectWallet";
import { useSwapActions } from "@/state/swapStore";
import { Button } from "../ui/Button";

export const FaucetComponent = () => {
  const { address } = useAccount();

  const { signer, chainId, provider } = useAccountState();
  const [userBalances, setUserBalances] = useState<
    Record<SupportedToken, string>
  >({} as Record<SupportedToken, string>);
  const [loadingToken, setLoadingToken] = useState<SupportedToken | null>(null);

  const { updateTokenBalances, fetchAllTokens } = useSwapActions();
  const {
    cooldowns,

    setIsLoading,
    setCooldown,
    setFaucetBalance,
  } = useFaucetStore();

  const checkCooldown = useCallback(
    async (symbol: SupportedToken, faucetAddress: string) => {
      if (!signer || !faucetAddress) return;

      try {
        const faucetContract = getFaucetContract(faucetAddress, signer);
        const userAddress = await signer.getAddress();
        const lastRequestTime = await faucetContract.lastRequestTime(
          userAddress
        );
        const cooldownPeriod = await faucetContract.cooldownTime();

        const lastRequestTimeInSeconds = Number(lastRequestTime);
        const cooldownPeriodInSeconds = Number(cooldownPeriod);
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);

        const cooldownLeftInSeconds =
          cooldownPeriodInSeconds -
          (currentTimeInSeconds - lastRequestTimeInSeconds);
        const remaining = cooldownLeftInSeconds > 0 ? cooldownLeftInSeconds : 0;

        setCooldown(symbol, remaining);
      } catch (error) {
        console.error("Error checking cooldown:", error);
      }
    },
    [signer, setCooldown]
  );

  const requestTokens = async (symbol: SupportedToken) => {
    if (!signer || !chainId || !address || !provider) {
      toast.error("Wallet or signer not available");
      return;
    }
    setLoadingToken(symbol);

    const tokenAddress = TOKENS[symbol]?.addresses[chainId];
    const faucetAddress = TOKENS[symbol]?.faucetAddresses[chainId];
    if (!tokenAddress || !faucetAddress) {
      toast.error("Token not supported on this network");
      return;
    }
    const tokenContract = getErc20Contract(tokenAddress, signer);
    const faucetContract = getFaucetContract(faucetAddress, signer);

    const balance = await tokenContract.balanceOf(faucetAddress);
    const decimals = await tokenContract.decimals();

    const formattedBalance = formatUnits(balance, decimals);
    setFaucetBalance(symbol, formattedBalance);

    if (parseFloat(formattedBalance) <= 0) {
      toast.error("Faucet has no tokens left to distribute");
      return;
    }

    if (cooldowns[symbol] > 0) {
      toast.error(
        `Please wait ${cooldowns[symbol]} seconds before requesting again.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const tx = await faucetContract.requestTokens();
      await toast.promise(tx.wait(), {
        loading: "Transaction pending...",
        success: "Tokens successfully requested!",
        error: "Transaction failed",
      });

      await addContractToMetamask(symbol, tokenAddress);
      await checkCooldown(symbol, faucetAddress);
      await updateTokenBalances(String(address), provider);
      fetchAllTokens(address.toString(), provider);
    } catch (error: any) {
      toast.error(`Error:Transaction failed}`);
      console.error("Transaction error:", error);
    } finally {
      setIsLoading(false);
      setLoadingToken(null);
    }
  };

  const addContractToMetamask = async (
    symbol: string,
    tokenAddress: string
  ) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: tokenAddress,
              symbol: symbol,
              decimals: 18,
            },
          },
        });
      } catch (error) {
        console.error("Error adding token to MetaMask:", error);
      }
    }
  };

  function formatCooldownTime(seconds: number) {
    const d = Math.floor(seconds / (60 * 60 * 24));
    const h = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const m = Math.floor((seconds % (60 * 60)) / 60);
    const s = seconds % 60;
    return `${d > 0 ? `${d}d ` : ""}${h > 0 ? `${h}h ` : ""}${
      m > 0 ? `${m}m ` : ""
    }${s}s`;
  }

  useEffect(() => {
    if (!address || !chainId || !signer) return;

    Object.entries(TOKENS).forEach(([symbol, token]) => {
      const tokenSymbol = symbol as SupportedToken;
      const tokenAddress = token.addresses[chainId];
      const faucetAddress = token.faucetAddresses[chainId];
      if (tokenAddress && faucetAddress) {
        checkCooldown(tokenSymbol, faucetAddress);
        // fetchTokenBalance(tokenSymbol, tokenAddress);
      }
    });

    // Set up a timer to update cooldowns
    const timer = setInterval(() => {
      Object.entries(TOKENS).forEach(([symbol, token]) => {
        const tokenSymbol = symbol as SupportedToken;
        const faucetAddress = token.faucetAddresses[chainId];
        if (faucetAddress) {
          checkCooldown(tokenSymbol, faucetAddress);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [address, chainId, signer, checkCooldown]);

  if (!address) {
    return (
      <div className="bg-muted p-6 border border-border max-w-md mx-auto shadow-md text-center">
        <p className="mb-4">Connect your wallet to access the faucet</p>
        <ConnectWallet />
      </div>
    );
  }

  return (
    <div className="bg-forground p-6 border border-border max-w-3xl w-full h-fit mx-auto shadow-md">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-border">
            <th className="pb-2">Token</th>
            {/* <th className="pb-2">Balance</th> */}
            <th className="pb-2">Cooldown</th>
            <th className="pb-2 flex justify-center items-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(TOKENS).map(
            ([key, { symbol, image, addresses, faucetAddresses }]) => {
              const tokenSymbol = symbol as SupportedToken;

              const tokenAddress = addresses[chainId ?? 0];
              const faucetAddress = faucetAddresses[chainId ?? 0];
              if (!tokenAddress || !faucetAddress) return null;
              return (
                <tr key={symbol} className="border-b border-border">
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <Image
                        src={image}
                        alt={symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{symbol}</span>
                    </div>
                  </td>
                  {/* <td className="py-4">
                    {userBalances[tokenSymbol]
                      ? Number(userBalances[tokenSymbol]).toFixed()
                      : "0.0000"}
                  </td> */}
                  <td className="py-4">
                    {formatCooldownTime(cooldowns[tokenSymbol] || 0)}
                  </td>
                  <td className="py-4 flex items-center justify-center">
                    <Button
                      variant={"primary"}
                      onClick={() => requestTokens(tokenSymbol)}
                      disabled={
                        loadingToken !== null || cooldowns[tokenSymbol] > 0
                      }
                      className={`px-3 py-1 text-white text-sm font-medium ${
                        cooldowns[tokenSymbol] > 0 ||
                        loadingToken === tokenSymbol
                          ? "bg-secondary cursor-not-allowed"
                          : "bg-primary-dark hover:bg-primary"
                      }`}
                    >
                      {loadingToken === tokenSymbol
                        ? "Loading..."
                        : "Get Tokens"}
                    </Button>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
};
