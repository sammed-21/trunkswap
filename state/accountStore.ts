import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { getProvider } from "@/services/walletEvents";

interface AccountInfo {
  signer: any;
  provider: ethers.Provider | null;
  chainId: number | null;
  viemClient: any;
  isInitialized: boolean; // Add this to track initialization state

  setSigner: (signer: any) => void;
  setProvider: (provider: any) => void;
  setChainId: (chainId: any) => void;
  setViemClient: (viemClient: any) => void;
  setInitialized: (initialized: boolean) => void;
  resetAccountStore: () => void;
}

// Default state object
const defaultAccountState = {
  signer: null,
  provider: null,
  chainId: null,
  viemClient: null,
  isInitialized: false,
};

export const useAccountStore = create<AccountInfo>((set) => ({
  ...defaultAccountState,

  setSigner: (signer: any) => set(() => ({ signer })),
  setProvider: (provider: any) => set(() => ({ provider })),
  setChainId: (chainId: any) => set(() => ({ chainId })),
  setViemClient: (viemClient: any) => set(() => ({ viemClient })),
  setInitialized: (initialized: boolean) =>
    set(() => ({ isInitialized: initialized })),
  resetAccountStore: () => set(() => ({ ...defaultAccountState })),
}));

// Selector for State Only
export const useAccountState = () =>
  useAccountStore(
    useShallow((state: AccountInfo) => ({
      signer: state.signer,
      provider: state.provider,
      chainId: state.chainId,
      viemClient: state.viemClient,
      isInitialized: state.isInitialized,
    }))
  );

// Selector for Actions Only
export const useAccountActions = () =>
  useAccountStore(
    useShallow((state: AccountInfo) => ({
      setSigner: state.setSigner,
      setChainId: state.setChainId,
      setProvider: state.setProvider,
      setViemClient: state.setViemClient,
      setInitialized: state.setInitialized,
      resetAccountStore: state.resetAccountStore,
    }))
  );
