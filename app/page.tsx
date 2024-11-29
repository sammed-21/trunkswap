import { Navbar } from "@/components/Navbar/Navbar";
import { PriceChart } from "@/components/PriceChart/PriceChart";
import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <PriceChart />
      <SwapWidget />
    </div>
  );
}
