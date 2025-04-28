import React, { useState } from "react";
import { ToolTipComponent } from "../Common/ToolTipComponent";

import { useSwapActions, useSwapState } from "@/state/swapStore";
type Props = {};

export const DeadlineComponent = (props: Props) => {
  const { deadline } = useSwapState();
  const { setDeadline } = useSwapActions();
  const [deadlineCustom, setDeadlineCustom] = useState<any>(20);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeadlineCustom(value);
    setDeadline(Number(value || 0)); // Also update store live if needed
  };
  return (
    <div className="flex px-1 border-[1px] border-border text-base w-full">
      <div className="flex justify-start py-2 gap-1 w-full ">
        <h1 className="text-base font-semibold px-2">Swap deadline</h1>
        <ToolTipComponent content="Your transaction will revert if the prices change more then the slippage percentage" />
      </div>
      <div className="flex w-fit border-[1px] my-1  items-center justify-center border-border px-1 gap-2">
        <input
          type="string"
          value={deadlineCustom}
          onChange={handleCustomChange}
          placeholder="0.00"
          className="w-12 text-xl  bg-transparent outline-none border-none text-right"
          onClick={(e) => e.stopPropagation()} // so clicking input doesn't re-trigger Tabs
        />
        <span>minutes</span>
      </div>
    </div>
  );
};
