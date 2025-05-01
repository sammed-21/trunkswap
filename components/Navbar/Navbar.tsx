"use client";
import React from "react";
import { ConnectWallet } from "../ConnetWalletButton/ConnectWallet";
import Link from "next/link";
import logo from "@/public/logo/logo21.png";
import Image from "next/image";
import { ModeToggle } from "../Common/ModeToggle";

export const Navbar = () => {
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
      </div>
      <div className="flex gap-2 items-center justify-end">
        <ModeToggle />
        <ConnectWallet />
      </div>
    </nav>
  );
};
