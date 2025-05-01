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

type Props = {};

export const SlippageModal = (props: Props) => {
  const { slippage } = useSwapState();
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2 border-[1px] border-border p-2">
            <FaGear />
            <p>{slippage}</p>
          </div>
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
