import create from "zustand";

interface ChartState {
  timePeriod: "1H" | "24H" | "1W" | "1M" | "1Y";
  priceData: Array<{ time: string; price: number }>;
  setTimePeriod: (period: string) => void;
  setPriceData: (data: Array<{ time: string; price: number }>) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  timePeriod: "24H",
  priceData: [],
  setTimePeriod: (period) => set({ timePeriod: period }),
  setPriceData: (data) => set({ priceData: data }),
}));
