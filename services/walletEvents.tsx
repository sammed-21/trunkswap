"use client";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useAccountActions, useAccountState } from "@/state/accountStore";
import { chainMaps, config, localhost } from "@/wagmi/config";
import { createPublicClient, http } from "viem";
import { ethers, JsonRpcProvider } from "ethers";
import { useCallback, useEffect } from "react";
import { defaultChainId, fallbackUrls } from "@/lib/constants";
import { watchAccount, watchChainId } from "@wagmi/core";
import { usePoolActions } from "@/state/poolStore";
import { addressess } from "@/address";
import { getNetworkNameUsingChainId } from "./getNetworkNameUsingChainId";
import { usePriceFeed } from "@/hooks/usePriceFeed";
import { useFaucetStore } from "@/state/faucetStore";

// Your fallback URLs and chain mapping

const chainMap: Record<number, any> = {
  ...chainMaps,
  31337: localhost,
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
};

// Factory address for fetching pool data
type Props = { children: React.ReactNode };
export const WalletInit = ({ children }: Props) => {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected, isDisconnected } = useAccount();
  const chainId = useChainId();

  let walletSigner: ethers.Signer | null;

  const resetFaucetState = useFaucetStore((state) => state.resetFaucetState);

  const getSigners = useCallback(async () => {
    if (isConnected && window.ethereum) {
      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await walletProvider.getSigner();
      setSigner(signer);
    }
  }, [isConnected]);

  const { isInitialized, provider } = useAccountState();

  const {
    setProvider,
    setSigner,
    setChainId,
    setViemClient,
    resetAccountStore,
    setAddress,
    setInitialized,
  } = useAccountActions();

  const { clearPoolStore } = usePoolActions();

  let FACTORY_ADDRESS =
    addressess[getNetworkNameUsingChainId(defaultChainId)].FACTORY_ADDRESS;
  // Helper function to initialize provider
  const initializeProvider = async (currentChainId: number) => {
    try {
      const chain = chainMaps[currentChainId] || chainMap[defaultChainId]; // Default to Arbitrum Sepolia

      // Always create a provider regardless of wallet connection
      const rpcUrl =
        fallbackUrls[currentChainId] || fallbackUrls[defaultChainId];

      FACTORY_ADDRESS =
        addressess[getNetworkNameUsingChainId(currentChainId)].FACTORY_ADDRESS;
      const ethersProvider = new JsonRpcProvider(rpcUrl);

      // Set up viem client
      const viemClient = createPublicClient({
        batch: { multicall: true },
        chain,
        transport: http(rpcUrl),
      });

      setProvider(ethersProvider);
      setChainId(currentChainId);
      setViemClient(viemClient);

      setInitialized(true);
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
    const initialProvider = async () => {
      await initializeProvider(chainId || defaultChainId);
    };

    if (!isInitialized || !provider) {
      initialProvider();
    }

    if (isConnected) {
      setAddress(address!?.toString());
      getSigners();
    }
  }, [isInitialized, isConnected]);

  // Handle disconnection
  useEffect(() => {
    if (isDisconnected) {
      // Keep the provider but clear user-specific data
      setSigner(null);
      resetFaucetState();
      resetAccountStore();
      clearPoolStore();
    }
  }, [isDisconnected]);

  // Handle chain changes
  useEffect(() => {
    if (!chainId) return;
    resetFaucetState();
    // Reset pool store when chain changes
    resetAccountStore();

    clearPoolStore();

    // Initialize for the new chain
    initializeProvider(chainId);
  }, [chainId]);

  return <div>{children}</div>;
};

// Helper function to get provider
