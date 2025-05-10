// store/useFaucetStore.ts

import { create } from "zustand";

interface FaucetState {
  isLoading: boolean;
  cooldowns: { [key: string]: number }; // keyed by token type: 'STX', 'RSTX'
  faucetBalances: { [key: string]: string }; // keyed by token type

  setIsLoading: (loading: boolean) => void;
  setCooldown: (token: string, cooldown: number) => void;
  setFaucetBalance: (token: string, balance: string) => void;

  resetFaucetState: () => void;
}

const defaultFaucetState = {
  isLoading: false,
  cooldowns: {},
  faucetBalances: {},
};

export const useFaucetStore = create<FaucetState>((set) => ({
  ...defaultFaucetState,

  setIsLoading: (loading: boolean) => set(() => ({ isLoading: loading })),

  setCooldown: (token, cooldown) =>
    set((state) => ({
      cooldowns: {
        ...state.cooldowns,
        [token]: cooldown,
      },
    })),

  setFaucetBalance: (token, balance) =>
    set((state) => ({
      faucetBalances: {
        ...state.faucetBalances,
        [token]: balance,
      },
    })),

  resetFaucetState: () => set(() => ({ ...defaultFaucetState })),
}));
