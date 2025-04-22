"use client";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import {
  AccountInfo,
  SwapActions,
  SwapState,
  Token,
  TokenDetail,
} from "@/lib/types";
import { sign } from "crypto";
import { chainMap } from "@/wagmi/config";
import { createPublicClient, http } from "viem";
import { getProvider } from "@/services/walletEvents";

// Unified Zustand Store
const useAccountStore = create<AccountInfo>((set) => ({
  signer: null,
  provider: null,
  chainId: null,
  viemClient: null,

  setSigner: (signer: any) => set(() => ({ signer: signer })),
  setProvider: (provider: any) => set(() => ({ provider: provider })),
  setChainId: (chainId: any) => set(() => ({ chainId: chainId })),
  setViemClient: (viemClient: any) => set(() => ({ viemClient: viemClient })),
}));

// Selector for State Only
export const useAccountState = () =>
  useAccountStore(
    useShallow((state: AccountInfo) => ({
      // Include selectorOpen state
      signer: state.signer,
      provider: state.provider,
      chainId: state.chainId,
      viemClient: state.viemClient,
    }))
  );

// Selector for Actions Only
export const useAccountActions = () =>
  useAccountStore(
    useShallow((state: AccountInfo) => ({
      // Include setSelectorOpen action
      setSigner: state.setSigner,
      setChainId: state.setChainId,
      setProvider: state.setProvider,
      setViemClient: state.setViemClient,
    }))
  );
