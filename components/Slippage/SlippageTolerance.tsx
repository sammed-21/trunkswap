import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { DefaultSlippage } from "@/lib/constants";
import { ToolTipComponent } from "../Common/ToolTipComponent";

type Props = {};

export const SlippageTolerance = (props: Props) => {
  const { slippage } = useSwapState();
  const { setSlippage } = useSwapActions();
  const [customSlippage, setCustomSlippage] = useState<string | number>(
    slippage
  );
  const handleValueChange = (value: string) => {
    // value will be string like '0.1', '0.3', etc.
    setSlippage(Number(value)); // convert string to number and set
  };
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSlippage(value);
    setSlippage(Number(value || 0)); // Also update store live if needed
  };

  return (
    <div className="w-full mb-2 h-full relative">
      <Tabs
        defaultValue="0.1"
        className="w-full"
        onValueChange={handleValueChange}
      >
        <TabsList className="flex border-[1px] border-border p-1 w-ful h-full flex-row gap-1">
          <div className="flex justify-start gap-1 w-full ">
            <h1 className="text-base font-semibold px-2">Max slippage</h1>
            <ToolTipComponent
              subTitle="Max slippage"
              content="Your transaction will revert if the price changes more than the slippage percentage."
            />
          </div>
          <TabsTrigger
            value={DefaultSlippage}
            className="data-[state=active]:bg-primary text-lg h-10 w-20 border-[1px] border-border data-[state=active]:text-white"
          >
            Auto
          </TabsTrigger>

          <TabsTrigger
            value="1"
            className="data-[state=active]:bg-primary-dark text-lg h-10 border-[1px] border-border data-[state=active]:text-white"
          >
            <span>Custom</span>
            <input
              type="string"
              value={customSlippage}
              onChange={handleCustomChange}
              placeholder="0.00"
              className="w-12 bg-transparent outline-none border-none text-right"
              onClick={(e) => e.stopPropagation()} // so clicking input doesn't re-trigger Tabs
            />
            <span>%</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
