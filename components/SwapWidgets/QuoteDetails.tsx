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
      <div className="p-4   rounded-lg shadow-sm  border-border h-fit max-w-[448px] w-full    space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-textpriamry">Price Impact</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textpriamry">Max. Received</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textpriamry">Min. Received</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textpriamry">Fee (0.30%)</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textpriamry">Network Fee</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-textpriamry">Routing Source</span>

          <span>
            {" "}
            <Skeleton className="w-[100px] h-[20px] rounded-none" />
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 border rounded-lg shadow-sm border-border h-fit max-w-[448px] w-full space-y-2">
      <h2 className="text-lg font-semibold">Swap Details</h2>
      <div className="flex justify-between text-sm">
        <span>Price Impact</span>
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
        <span>Max. Received</span>
        <span>
          {maxReceived} {buySymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Min. Received</span>
        <span>
          {minReceived} {buySymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Fee (0.30%)</span>
        <span>
          {Number(fee).toFixed(6)} {sellSymbol}
          {/* {feeUSD && ` (≈ $${feeUSD})`} */}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Network Fee</span>
        <span>{networkFeeUsd && `≈ ${networkFeeUsd} ETH`}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Routing Source</span>
        <span>{routingSource}</span>
      </div>
    </div>
  );
};
