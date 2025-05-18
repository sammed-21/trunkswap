import React, { useState } from "react";
import { ToolTipComponent } from "../Common/ToolTipComponent";

import { useSwapActions, useSwapState } from "@/state/swapStore";
type Props = {
  setDeadline: (deadline: number) => void;
};

export const DeadlineComponent = ({ setDeadline }: Props) => {
  const [deadlineCustom, setDeadlineCustom] = useState<any>(20);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeadlineCustom(value);
    setDeadline(Number(value || 0)); // Also update store live if needed
  };
  return (
    <div className="flex  flex-col text-base w-full">
      <div className="flex justify-start py-2 gap-1 w-full ">
        <h1 className="text-sm font-semibold">Swap deadline</h1>
        {/* <ToolTipComponent content="Your transaction will revert if the prices change more then the slippage percentage" /> */}
        <ToolTipComponent
          subTitle="Deadline"
          content="Your transaction will revert if it is pending for more than this period of time. (Maximum: 3 days)."
        />
      </div>
      <div className="flex w-full  my-1   items-center justify-start   gap-2">
        <div className="flex items-start bg-background justify-start rounded-lg  text-left  w-[100px] border-[1px] border-border  p-1">
          <input
            type="string"
            value={deadlineCustom}
            onChange={handleCustomChange}
            placeholder="0.00"
            className="w-full text-xl  px-3 text-left  bg-transparent outline-none border-none "
            onClick={(e) => e.stopPropagation()} // so clicking input doesn't re-trigger Tabs
          />
        </div>
        <span>minutes</span>
      </div>
    </div>
  );
};
