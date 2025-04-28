"use client";

import { PriceChart } from "@/components/PriceChart/PriceChart";
import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";

export default function Home() {
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <PriceChart />
      <SwapWidget />
    </div>
  );
}
