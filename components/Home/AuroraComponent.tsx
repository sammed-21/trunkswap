"use client";

import { motion } from "motion/react";
import React from "react";
import { AuroraBackground } from "../ui/aurora-background";
import Image from "next/image";
import Link from "next/link";

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 w-full items-center justify-center px-4"
      >
        <div className="text-3xl md:text-5xl font-bold dark:text-white text-center">
          TrunkSwap – Powering the Next Generation of DeFi
        </div>
        <div className="font-extralight flex gap-2 w-90 text-base md:text-xl max-w-3xl text-center dark:text-neutral-200 py-4">
          Swap assets, fuel liquidity, and grow your yield — all in one trunk.
          Experience secure, blazing-fast decentralized trading tailored for
          unstoppable DeFi explorers.
        </div>
        <Link
          href={"/swap"}
          className="bg-black dark:bg-white rounded-none w-fit text-white dark:text-black px-4 py-2"
        >
          Start Trading
        </Link>
      </motion.div>
    </AuroraBackground>
  );
}
