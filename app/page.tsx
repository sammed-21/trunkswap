import { SwapWidget } from "@/components/SwapWidgets/SwapWidget";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <SwapWidget />
    </div>
  );
}
