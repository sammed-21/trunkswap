import React from "react";
import { SlippageModal } from "../Slippage/SlippageModal";
import { SwapWidget } from "./SwapWidget";
import { usePriceFeed } from "@/hooks/usePriceFeed";

type Props = {};

export const SwapComponent = (props: Props) => {
  return (
    <div className="flex w-full flex-col max-w-[424px] mb-2 items-center justify-center ">
      <SwapWidget />
    </div>
  );
};
