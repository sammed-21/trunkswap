"use client";

import React from "react";

interface QuoteDetailsProps {
  maxReceived: string;
  minReceived: string;
  fee: string;
  networkFee: string;
  networkFeeUsd?: string;
  priceImpact?: string;
  routingSource: string;
  buySymbol: string;
  sellSymbol: string;
}

export const QuoteDetails: React.FC<QuoteDetailsProps> = ({
  maxReceived,
  minReceived,
  fee,
  networkFee,
  networkFeeUsd,
  priceImpact = "-0.05%", // default
  routingSource,
  buySymbol,
  sellSymbol,
}) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-black space-y-2">
      <h2 className="text-lg font-semibold">Swap Details</h2>
      <div className="flex justify-between text-sm">
        <span>Price Impact</span>
        <span>{priceImpact}</span>
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
        <span>Fee (0.25%)</span>
        <span>
          {fee} {sellSymbol}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Network Fee</span>
        <span>
          {networkFee} ETH {networkFeeUsd && `(≈ $${networkFeeUsd})`}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Routing Source</span>
        <span>{routingSource}</span>
      </div>
    </div>
  );
};
