"use client";
import { FaucetComponent } from "@/components/Faucet/FaucetComponent";

export default function Pool() {
  return (
    <div className="w-full relative h-full mx-auto py-10   gap-4 flex flex-col md:flex-col  items-start justify-center">
      <FaucetComponent />
    </div>
  );
}
