"use client";
import { SwapComponent } from "@/components/SwapWidgets/SwapComponent";

export default function Home() {
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <SwapComponent />
    </div>
  );
}
