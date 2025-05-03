"use client";
import { PoolList } from "@/components/Pool/PoolList";
import { PoolListHead } from "@/components/Pool/PoolListHead";

export default function Pool() {
  return (
    <div className="w-full relative h-full mx-auto py-10 px-4 gap-4 flex flex-col md:flex-col  items-start justify-center">
      <PoolListHead />

      {/* <div className="flex flex-col items-center justify-center gap-3">
        <PoolPositionsList />
      </div> */}

      <div className="w-full max-w-[1440px] flex flex-col justify-center mx-auto">
        <PoolList />
      </div>
    </div>
  );
}
