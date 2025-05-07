"use client";
import { TradingViewWidget } from "@/components/Chart/TradingViewWidget";
import { SwapComponent } from "@/components/SwapWidgets/SwapComponent";
import { useSwapState } from "@/state/swapStore";

export default function Home() {
  const { chartFlag } = useSwapState();
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <div
        className={`max-w-[1024px] w-full h-[400px] ${
          chartFlag ? "block" : "hidden"
        } md:max-h-[800px] relative `}
      >
        <TradingViewWidget />
      </div>
      <SwapComponent />
    </div>
  );
}
