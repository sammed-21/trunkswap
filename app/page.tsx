"use client";

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/swap");
  return (
    <div className="w-full relative h-full mx-auto py-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      Welcome to the 0xDex
    </div>
  );
}
