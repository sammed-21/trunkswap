import { create } from "zustand";

interface ChartState {
  timePeriod: "1H" | "24H" | "1W" | "1M" | "1Y";
  priceData: Array<{ time: string; price: number }>;
  setTimePeriod: (period: string) => void;
  setPriceData: (data: Array<{ time: string; price: number }>) => void;
}

export const useChartStore = create<ChartState>(
  (set: (arg0: { timePeriod?: any; priceData?: any }) => any) => ({
    timePeriod: "24H",
    priceData: [],
    setTimePeriod: (period: any) => set({ timePeriod: period }),
    setPriceData: (data: any) => set({ priceData: data }),
  })
);
