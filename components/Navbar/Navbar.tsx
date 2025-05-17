"use client";
import React, { useState } from "react";
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
import { BarChart2 } from "lucide-react";
import {
  FaBabyCarriage,
  FaBanSmoking,
  FaBarsProgress,
  FaBarsStaggered,
  FaBurger,
  FaThreads,
} from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // adjust path if needed
import { DropdownMenuDemo } from "./NavbarDropDown";

export const Navbar = () => {
  usePriceFeed();
  useInitialLoad();

  return (
    <nav className="h-20 border-b-[1px] text-title bg-background  backdrop-filter backdrop-blur-lg bg-opacity-30 border-border px-4  rounded-none  justify-between flex items-center  w-full font-semibold ">
      <div className="flex gap-3 space-x-2 items-center justify-start">
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
        <div className="">
          <div className="flex max-lg:hidden gap-10 items-center justify-start">
            <Link href="/swap">Swap</Link>
            <Link href="/pool">Pool</Link>
            <Link href="/Faucet">Faucet</Link>
          </div>
        </div>
      </div>

      <div className=" flex gap-2 items-center justify-end">
        <ModeToggle />
        <div className="hidden md:flex gap-3 items-center">
          <ShowETHBalance />
          <NetworkComponent />
        </div>
        <ConnectWallet />
        <div className=" h-full lg:hidden flex relative w-fit ">
          <DropdownMenuDemo />
        </div>
      </div>

      {/* <div
        className={`fixed right-0 top-0 h-screen bg-forground border-l-[1px] border-border `}
      ></div> */}
    </nav>
  );
};
