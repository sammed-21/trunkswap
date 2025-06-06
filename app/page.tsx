"use client";

import { AuroraBackgroundDemo } from "@/components/Home/AuroraComponent";
import { redirect } from "next/navigation";

export default function Home() {
  // redirect("/swap");
  return (
    <div className="w-full relative  mx-auto pb-10  gap-4 flex flex-col md:flex-row  items-start justify-center">
      <AuroraBackgroundDemo />
    </div>
  );
}
