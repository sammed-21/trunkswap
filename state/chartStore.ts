import { create } from "zustand";

interface ChartStore {
  tokenSymbol: string;
  setTokenSymbol: (symbol: string) => void;
}

export const useChartStore = create<ChartStore>((set) => ({
  tokenSymbol: "USDC", // default
  setTokenSymbol: (symbol) => set({ tokenSymbol: symbol.toUpperCase() }),
}));
