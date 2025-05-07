"use client";

import { formatDigits, shortenAddress } from "@/lib/utils";
import React from "react";
import { runInContext } from "vm";
import { Skeleton } from "../ui/skeleton";
import { Prices } from "@/lib/types";
import { usePriceState } from "@/state/priceStore";

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
  prices: Prices | null;
  isLoading: boolean;
  address: string | undefined | `0x${string}`;
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
  prices,
  address,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 shadow-sm transaction duration-500 translate-y-0 h-fit max-w-[448px] w-full space-y-2">
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
        <span className="text-textprimary"> {slippage}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Max. Received</span>
        <span className="text-textprimary">
          {formatDigits(maxReceived)} {buySymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Min. Received</span>
        <span className="text-textprimary">
          {formatDigits(minReceived)} {buySymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Fee (0.30%)</span>
        <span className="text-textprimary">
          {formatDigits(Number(fee))} {sellSymbol}{" "}
          {/* {feeUSD && ` (≈ $${feeUSD})`} */}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Network Fee</span>
        <span className="text-textprimary">
          {networkFeeUsd && `≈ ${networkFeeUsd} ETH`}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-subtitle">Routing Source</span>
        <span className="text-textprimary">{routingSource}</span>
      </div>
      {address && (
        <div className="flex justify-between text-sm">
          <span className="text-subtitle">Recipient</span>
          <span className="font-bold text-base text-textprimary">
            {shortenAddress(address)}
          </span>
        </div>
      )}
    </div>
  );
};
