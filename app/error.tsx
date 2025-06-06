"use client";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import React from "react";

type Props = {};

const error = (props: Props) => {
  return (
    <div className="h-screen w-full max-w-[1440px] flex items-center justify-center text-3xl font-semibold ">
      <div>
        Something went wrong
        <Link href={"/pools"}>
          <Button variant={"secondary"}>Back</Button>
        </Link>
      </div>
    </div>
  );
};

export default error;
