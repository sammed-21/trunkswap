"use client";

import { PriceChart } from "@/components/PriceChart/PriceChart";
import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";
import { usePriceFeed } from "@/hooks/usePriceFeed";

export default function Home() {
  usePriceFeed();
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <PriceChart />
      <SwapWidget />
    </div>
  );
}
