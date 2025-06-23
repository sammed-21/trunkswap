import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaGear } from "react-icons/fa6";
import { SlippageTolerance } from "./SlippageTolerance";
import { DeadlineComponent } from "./DeadlineComponent";
import { useSwapState } from "@/state/swapStore";

type Props = {
  slippage: any;
  setSlippage: (value: number) => void;
  setDeadline: (value: number) => void;
};

export const SlippageModal = ({
  slippage,
  setDeadline,
  setSlippage,
}: Props) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2  p-2">
            <FaGear />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-[400px] flex flex-col gap-3 p-4 w-full h-fit relative  ">
          <h1 className="text-textprimary text-xs">Transaction Settings</h1>
          <div className=" flex flex-col gap-1 w-full rounded-lg ">
            <SlippageTolerance slippage={slippage} setSlippage={setSlippage} />
            <DeadlineComponent setDeadline={setDeadline} />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
