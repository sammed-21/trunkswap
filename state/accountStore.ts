import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { ethers, Signer } from "ethers";
import { defaultChainId } from "@/lib/constants";

interface AccountInfo {
  signer: any;
  address: string | null;
  provider: ethers.Provider | null;
  chainId: number | null;
  viemClient: any;
  isInitialized: boolean; // Add this to track initialization state

  setSigner: (signer: Signer | null) => void;
  setProvider: (provider: any) => void;
  setChainId: (chainId: any) => void;
  setViemClient: (viemClient: any) => void;
  setInitialized: (initialized: boolean) => void;
  setAddress: (address: string) => void;
  resetAccountStore: () => void;
}

// Default state object
const defaultAccountState = {
  signer: null,
  address: null,
  provider: null,
  chainId: defaultChainId,
  viemClient: null,
  isInitialized: false,
};

export const useAccountStore = create<AccountInfo>((set) => ({
  ...defaultAccountState,

  setSigner: (signer: Signer | null) => set(() => ({ signer })),
  setProvider: (provider: any) => set(() => ({ provider })),
  setChainId: (chainId: any) => set(() => ({ chainId })),
  setViemClient: (viemClient: any) => set(() => ({ viemClient })),
  setInitialized: (initialized: boolean) =>
    set(() => ({ isInitialized: initialized })),
  setAddress: (address: string) => set(() => ({ address })),
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
      address: state.address,
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
      setAddress: state.setAddress,
      resetAccountStore: state.resetAccountStore,
    }))
  );
