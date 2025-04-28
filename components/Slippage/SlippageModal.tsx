import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaGear } from "react-icons/fa6";
import { SlippageTolerance } from "./SlippageTolerance";
import { DeadlineComponent } from "./DeadlineComponent";

type Props = {};

export const SlippageModal = (props: Props) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <FaGear />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[400px] w-fit h-fit relative min-h-[150px] ">
          <h1 className="text-xl font-semibold">Swap Settings </h1>
          <div className="p-2 flex flex-col gap-1 w-full rounded-none ">
            <SlippageTolerance />
            <DeadlineComponent />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
