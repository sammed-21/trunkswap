import Image from "next/image";
import Link from "next/link";
import React from "react";

import logo from "@/public/logo/logo21.png";
type Props = {};

export const Footer = (props: Props) => {
  return (
    <div className="w-full flex border-t-[2px] bg-forground border-border items-center justify-around h-[400px] mx-auto">
      <div className="grid grid-cols-12 mx-auto w-full max-w-4xl">
        <div className="col-span-4 flex flex-col gap-3 col-start-1 col-end-7  max-w-md w-full l  ">
          <Link
            href="/"
            className="flex gap-1 text-title items-center justify-start"
          >
            <Image
              src={logo}
              width={10}
              height={10}
              className=" object-cover w-6 h-6  "
              alt="logo"
            />
            <h3 className="text-primary text-2xl">Trunkswap</h3>
          </Link>
          <p className="text-xl">Trade smarter, faster, and more securely </p>
        </div>
        <div className="flex col-span-5 col-start-10 col-end-12 flex-col   gap-3 ">
          <h1 className="font-semibold">Social Media </h1>
          <Link href={"https://x.com/0xSam_21"}>Twitter</Link>
          <Link href={"https://github.com/sammed-21/trunkswap"}>Github</Link>
          <Link href={"https://t.me/Sammed_21"}>Telegram</Link>
        </div>
      </div>
    </div>
  );
};
