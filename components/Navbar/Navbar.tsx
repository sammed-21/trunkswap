"use client";
import React, { useEffect } from "react";
import { ConnectWallet } from "../ConnetWalletButton/ConnectWallet";
import Link from "next/link";
import logo from "@/public/logo/logo2.png";
import Image from "next/image";
import { useAccount, useChainId } from "wagmi";

export const Navbar = () => {
  return (
    <nav className="h-20 border-[1px] bg-primary backdrop-filter backdrop-blur-lg bg-opacity-30 border-border mt-5 px-4  rounded-none  justify-between flex items-center  w-full font-semibold ">
      <div className="flex gap-10 items-center justify-start">
        <Link href="/">
          <Image
            src={logo}
            width={90}
            height={50}
            className=" object-cover w-fit "
            alt="logo"
          />
        </Link>
        <Link href="/swap">swap</Link>
        <Link href="/pool">pool</Link>
      </div>

      <ConnectWallet />
    </nav>
  );
};
