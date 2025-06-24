"use client";
import { SlippageModal } from "@/components/Slippage/SlippageModal";
import { SlippageTolerance } from "@/components/Slippage/SlippageTolerance";
import { Button } from "@/components/ui/Button";
import { useSwapActions, useSwapState } from "@/state/swapStore";
import React from "react";

type Props = {};

export const SelectionHeading = (props: Props) => {
  const { slippage } = useSwapState();
  const { setDeadline, resetSwapState, setSlippage } = useSwapActions();
  return (
    <div className="flex  justify-between w-full  items-center my-3">
      <h1 className="text-title text-3xl font-medium ">New Position</h1>
      <div className="flex items-center justify-end gap-4 ">
        <Button variant={"secondary"} onClick={() => resetSwapState()}>
          Reset
        </Button>
        <SlippageModal
          setDeadline={setDeadline}
          setSlippage={setSlippage}
          slippage={slippage}
        />
      </div>
    </div>
  );
};
