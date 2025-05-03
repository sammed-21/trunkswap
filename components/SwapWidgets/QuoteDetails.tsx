"use client";

import { formatDigits } from "@/lib/utils";
import React from "react";
import { runInContext } from "vm";
import { Skeleton } from "../ui/skeleton";

interface QuoteDetailsProps {
  maxReceived: string | bigint;
  minReceived: string | null;
  fee: string | null;
  networkFee: string;
  networkFeeUsd?: string;
  slippage: any;
  priceImpact?: string | null;
  routingSource: string;
  buySymbol: string;
  sellSymbol: string;
  isLoading: boolean;
}

export const QuoteDetails: React.FC<QuoteDetailsProps> = ({
  maxReceived,
  minReceived,
  fee,
  slippage,
  networkFee,
  networkFeeUsd,
  priceImpact, // default
  routingSource,
  buySymbol,
  isLoading,
  sellSymbol,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 shadow-sm transaction duration-500 translate-y-0 h-fit max-w-[448px] w-full space-y-2">
        <h2 className="text-lg text-title font-semibold">Swap Details</h2>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Price Impact</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Slippage</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Max. Received</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Min. Received</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Fee (0.30%)</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Network Fee</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Routing Source</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 shadow-sm transaction duration-500 translate-y-0 h-fit max-w-[448px] w-full space-y-2">
      <h2 className="text-lg text-title font-semibold">Swap Details</h2>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Price Impact</span>
        <span
          className={`${
            Number(priceImpact?.replace("%", "")) > 1
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {priceImpact || "-"}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Slippage</span>
        <span className="text-title"> {slippage}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Max. Received</span>
        <span className="text-title">
          {formatDigits(maxReceived)} {buySymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Min. Received</span>
        <span className="text-title">
          {formatDigits(minReceived)} {buySymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Fee (0.30%)</span>
        <span className="text-title">
          {formatDigits(Number(fee))} {sellSymbol}
          {/* {feeUSD && ` (≈ $${feeUSD})`} */}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Network Fee</span>
        <span className="text-title">
          {networkFeeUsd && `≈ ${networkFeeUsd} ETH`}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Routing Source</span>
        <span className="text-title">{routingSource}</span>
      </div>
    </div>
  );
};
