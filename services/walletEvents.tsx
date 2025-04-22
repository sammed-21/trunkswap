"use client";

import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useAccountActions } from "@/state/accountStore";
import { chainMap, config } from "@/wagmi/config";
import { createPublicClient, http } from "viem";
import { JsonRpcProvider } from "ethers";
import { useEffect } from "react";
import { fallbackUrls } from "@/lib/constants";
import { getWalletClient, watchAccount, watchChainId } from "@wagmi/core";

export const WalletInit = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient(); // fix: it's an async hook that returns `data`
  const { setProvider, setSigner, setChainId, setViemClient } =
    useAccountActions();

  useEffect(() => {
    if (!chainId) return;
    console.log("iside the chaindi of the walletinit");
    const provider = getProvider(chainId);
    console.log({ provider });
    setProvider(provider);

    if (isConnected && walletClient) {
      const chain = chainMap[chainId];

      const viemClient = createPublicClient({
        batch: { multicall: true },
        chain,
        transport: http(),
      });

      setChainId(chainId);
      setSigner(walletClient);
      setViemClient(viemClient);
    }

    // Watch for account changes
    const unwatchAccount = watchAccount(config, {
      async onChange(account) {
        if (!account.address) return;
        if (!walletClient) return;

        const chain = chainMap[chainId];

        const viemClient = createPublicClient({
          batch: { multicall: true },
          chain,
          transport: http(),
        });

        const rpcUrl = fallbackUrls[chainId] || viemClient.transport.url;
        const ethersProvider = new JsonRpcProvider(rpcUrl);

        setProvider(ethersProvider);
        setSigner(walletClient);
        setChainId(chainId);
        setViemClient(viemClient);
      },
    });

    // Watch for chain changes
    const unwatchChain = watchChainId(config, {
      async onChange(chainId) {
        const walletClient = await getWalletClient(config);
        if (!walletClient) return;

        const chain = chainMap[chainId];

        const viemClient = createPublicClient({
          batch: { multicall: true },
          chain,
          transport: http(),
        });

        const rpcUrl = fallbackUrls[chainId] || viemClient.transport.url;
        const ethersProvider = new JsonRpcProvider(rpcUrl);

        setProvider(ethersProvider);
        setSigner(walletClient);
        setChainId(chainId);
        setViemClient(viemClient);
      },
    });

    return () => {
      unwatchAccount();
      unwatchChain();
    };
  }, [chainId, isConnected, walletClient]);

  return null;
};

// Keep your helper as is
export const getProvider = (chainId: number = 421614) => {
  const rpcUrl = fallbackUrls[chainId];
  const ethersProvider = new JsonRpcProvider(rpcUrl);
  return ethersProvider;
};
