"use client";
import AddLiquidityPage from "@/app/add-liquidity/[tokenA]/[tokenB]/page";
import { LoadingScreen } from "@/components/Common/LoadingScreen";
import TokenSelector from "@/components/SwapWidgets/TokenSelector";
import { Separator } from "@/components/ui/seperator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Token } from "@/lib/types";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import React, { useState } from "react";

type Props = {};
export const TabChooseTokenLiquidity = () => {
  const [token0, setToken0] = useState<string>("");
  const [selectorOpen, setSelectorOpen] = useState<string>("");
  const [token1, setToken1] = useState<string>("");
  return (
    <div className="w-full h-full flex flex-row justify-between relative">
      <Tabs defaultValue="token-pair" className="flex w-full  gap-10  ">
        <TabsList className="flex flex-col h-fit  items-start border-[1px]  border-border rounded-2xl p-3  w-full space-y-6">
          <TabsTrigger value="token-pair" className="group p-0">
            <TabItemText stepNumber={1} description="Select token and pair" />
          </TabsTrigger>

          <div className="h-10 flex bg-subtitle items-center justify-center ml-4">
            {/* Fake vertical separator */}
            <div className="w-[2px] h-full bg-muted" />
          </div>

          <TabsTrigger value="deposit-amount" className="group p-0">
            <TabItemText stepNumber={2} description="Enter deposit amount" />
          </TabsTrigger>
        </TabsList>
        <div className=" w-full  min-h-[500px] flex items-center justify-center border-[1px] border-border rounded-xl h-full min-w-[500px] bg-primary-dark ">
          <LoadingScreen title="...Coming soon" />;
        </div>
        {/* <div className=" w-full h-full min-w-[500px] ">
          <TabsContent value="token-pair">
            <div>
              Select pair Choose the tokens you want to provide liquidity for.
              You can select tokens on all supported networks.
              <div>
                
              </div>
            </div>
          </TabsContent>
          <TabsContent value="deposit-amount">
            <div>
              <AddLiquidityPage params={{ token0, token1 }} />
            </div>
          </TabsContent>
        </div> */}
      </Tabs>
    </div>
  );
};

type TabItemProps = {
  stepNumber: number;
  description: string;
};

function TabItemText({ stepNumber, description }: TabItemProps) {
  return (
    <div className="flex gap-4 items-center group-data-[state=active]:text-primary">
      <span
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xl",
          "group-data-[state=active]:bg-primary text-white",
          "bg-muted-foreground group-data-[state=inactive]:bg-muted"
        )}
      >
        {stepNumber}
      </span>
      <div className="flex flex-col gap-1 items-start">
        <span className="text-sm text-muted-foreground">Step {stepNumber}</span>
        <p className="text-base font-medium">{description}</p>
      </div>
    </div>
  );
}
