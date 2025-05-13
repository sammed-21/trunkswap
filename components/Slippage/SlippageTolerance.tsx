import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import { DefaultSlippage } from "@/lib/constants";
import { ToolTipComponent } from "../Common/ToolTipComponent";

type Props = {
  slippage: any;
  setSlippage: (value: number) => void;
};

export const SlippageTolerance = ({ slippage, setSlippage }: Props) => {
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
        {" "}
        <div className="flex justify-start gap-2 w-full ">
          <h1 className="text-sm font-semibold ">Max slippage</h1>
          <ToolTipComponent
            subTitle="Max slippage"
            content="Your transaction will revert if the price changes more than the slippage percentage."
          />
        </div>
        <TabsList className="flex px-0 w-ful h-full flex-row gap-1">
          <TabsTrigger
            value="1"
            className="data-[state=active]:bg-primary-dark w-[150px]  flex flex-row justify-between text-lg h-10 border-[1px] border-border data-[state=active]:text-white"
          >
            <input
              type="string"
              value={customSlippage}
              onChange={handleCustomChange}
              placeholder="0.00"
              className="w-6 bg-transparent flex justify-start items-start outline-none border-none text-right"
              onClick={(e) => e.stopPropagation()} // so clicking input doesn't re-trigger Tabs
            />
            <span>%</span>
          </TabsTrigger>
          <TabsTrigger
            value={DefaultSlippage}
            className="data-[state=active]:bg-primary text-lg h-10 w-20 border-[1px] data-[state=active]:border-primary border-border data-[state=active]:text-white"
          >
            Auto
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
