"use client";

import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import { useAccountActions, useAccountState } from "@/state/accountStore";
import { chainMaps, config } from "@/wagmi/config";
import { createPublicClient, http } from "viem";
import { ethers, JsonRpcProvider } from "ethers";
import { useEffect } from "react";
import { defaultChainId, fallbackUrls } from "@/lib/constants";
import { getWalletClient, watchAccount, watchChainId } from "@wagmi/core";
import { usePoolActions } from "@/state/poolStore";
import { addressess } from "@/address";
import { getNetworkNameUsingChainId } from "./getNetworkNameUsingChainId";
// Your fallback URLs and chain mapping

const chainMap = {
  ...chainMaps,
  421614: {
    id: 421614,
    name: "Arbitrum Sepolia",
    network: "arbitrum-sepolia",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: { http: [fallbackUrls[421614]] },
      public: { http: [fallbackUrls[421614]] },
    },
  },
  // Add other chains as needed
};

// Factory address for fetching pool data
type Props = { children: React.ReactNode };
export const WalletInit = ({ children }: Props) => {
  const { address, isConnected, isDisconnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  let walletSigner: ethers.Signer | ethers.JsonRpcSigner | null;

  const { isInitialized, provider } = useAccountState();
  const {
    setProvider,
    setSigner,
    setChainId,
    setViemClient,
    resetAccountStore,
    setInitialized,
  } = useAccountActions();

  const { fetchUserPositions, clearPoolStore } = usePoolActions();
  let FACTORY_ADDRESS =
    addressess[getNetworkNameUsingChainId(421614)].FACTORY_ADDRESS;
  // Helper function to initialize provider
  const initializeProvider = async (currentChainId: number) => {
    try {
      const chain = chainMaps[currentChainId] || chainMap[421614]; // Default to Arbitrum Sepolia

      // Always create a provider regardless of wallet connection
      const rpcUrl = fallbackUrls[currentChainId] || fallbackUrls[421614];
      FACTORY_ADDRESS =
        addressess[getNetworkNameUsingChainId(currentChainId)].FACTORY_ADDRESS;
      const ethersProvider = new JsonRpcProvider(rpcUrl);

      // Set up viem client
      const viemClient = createPublicClient({
        batch: { multicall: true },
        chain,
        transport: http(rpcUrl),
      });
      console.log(chain, address);
      setProvider(ethersProvider);
      setChainId(currentChainId);
      setViemClient(viemClient);
      // Set signer if wallet is connected
      console.log(isConnected);
      if (isConnected && window.ethereum) {
        console.log(isConnected);
        const walletProvider = new ethers.BrowserProvider(window.ethereum);

        // Get the signer from the wallet provider
        walletSigner = await walletProvider.getSigner();
        console.log({ walletSigner });
        // Store the signer in your state
        setSigner(walletSigner);
      }

      // If user is connected, fetch their positions

      setInitialized(true);
      // if(ethersProvider){

      //   fetchPoolData()
      // }
    } catch (error) {
      console.error("Failed to initialize provider:", error);
      // Set a fallback provider
      const fallbackProvider = new JsonRpcProvider(fallbackUrls[421614]);
      setProvider(fallbackProvider);
      setChainId(421614);
    }
  };

  // Initial setup
  useEffect(() => {
    // Initialize provider even if no wallet is connected
    if (!isInitialized || !provider) {
      initializeProvider(chainId || defaultChainId);
    }
  }, [isInitialized, isConnected]);

  // Handle disconnection
  useEffect(() => {
    if (isDisconnected) {
      // Keep the provider but clear user-specific data
      setSigner(null);
      clearPoolStore();
    }
  }, [isDisconnected]);

  // Handle chain changes
  useEffect(() => {
    if (!chainId) return;

    console.log("Chain changed to:", chainId);

    // Reset pool store when chain changes
    resetAccountStore();
    clearPoolStore();

    // Initialize for the new chain
    initializeProvider(chainId);
  }, [chainId]);

  // Watch for account changes
  useEffect(() => {
    console.log("hi iside watch");
    if (!isConnected) return;

    const unwatchAccount = watchAccount(config, {
      onChange(address) {
        if (address) {
          setSigner(null);
          clearPoolStore();
          return;
        }

        const currentChainId = chainId || 421614;

        if (walletClient) {
          setSigner(walletSigner);

          // Fetch user positions when account changes
          const provider = useAccountState().provider;
          if (provider && address) {
            fetchUserPositions(provider, address, FACTORY_ADDRESS);
          }
        }
      },
    });
    const unwatchChainId = watchChainId(config, {
      onChange(chainId) {
        if (address) {
          setSigner(null);
          clearPoolStore();
          return;
        }

        const currentChainId = chainId || 421614;

        if (walletSigner) {
          setSigner(walletSigner);

          // Fetch user positions when account changes
          const provider = useAccountState().provider;
          if (provider && address) {
            fetchUserPositions(provider, address, FACTORY_ADDRESS);
          }
        }
      },
    });

    // Clean up
    return () => {
      unwatchChainId();
      unwatchAccount();
    };
  }, [isConnected, walletClient, chainId]);

  return <div>{children}</div>;
};

// Helper function to get provider
export const getProvider = (chainId: number = 421614) => {
  const rpcUrl = fallbackUrls[chainId] || fallbackUrls[421614];

  return new JsonRpcProvider(rpcUrl);
};
