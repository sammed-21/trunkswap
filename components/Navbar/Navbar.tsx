"use client";
import React from "react";
import Link from "next/link";
import logo from "@/public/logo/logo21.png";
import Image from "next/image";
import { ModeToggle } from "../Common/ModeToggle";
import { useInitialLoad } from "../../hooks/useInitialLoad";
import ConnectWallet from "../Common/ConnectWallet";
import { NetworkComponent } from "../Common/NetworkComponent";
import { useTokenInitializer } from "@/hooks/useTokenInitializer";
import { ShowETHBalance } from "./ShowETHBalance";
import { usePriceFeed } from "@/hooks/usePriceFeed";

export const Navbar = () => {
  usePriceFeed();
  useInitialLoad();
  return (
    <nav className="h-20 border-[1px] text-title bg-background  backdrop-filter backdrop-blur-lg bg-opacity-30 border-border px-4  rounded-none  justify-between flex items-center  w-full font-semibold ">
      <div className="flex gap-10 items-center justify-start">
        <Link
          href="/"
          className="flex gap-1 text-title items-center justify-center"
        >
          <Image
            src={logo}
            width={30}
            height={30}
            className=" object-cover w-fit "
            alt="logo"
          />
          <h1>TrunkSwap</h1>
        </Link>
        <Link href="/swap">Swap</Link>
        <Link href="/pool">Pool</Link>
        <Link href="/Faucet">Faucet</Link>
      </div>
      <div className="flex gap-2 items-center justify-end">
        <ModeToggle />
        <ShowETHBalance />
        <NetworkComponent />
        <ConnectWallet />
      </div>
    </nav>
  );
};
