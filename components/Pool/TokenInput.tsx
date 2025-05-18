import { useState } from "react";
import { FormatUsd } from "../Common/FormatUsd";
import { useAccountState } from "@/state/accountStore";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { Button } from "../ui/Button";

interface TokenInputProps {
  label: string;
  token: any | null;
  value: string;
  onChange: (value: string) => void;
  usdValue: number | null;
  disabled?: boolean;
  tokenBalnce: string;
  isBalanceLoading: boolean;
}

export default function TokenInput({
  label,
  token,
  value,
  onChange,
  usdValue,
  disabled = false,
  tokenBalnce,
  isBalanceLoading,
}: TokenInputProps) {
  const { address } = useAccountState();

  return (
    <div className="bg-forground border-[1px] border-primary p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <div className="flex items-center bg-white dark:bg-forground border-none border-none-gray-200 dark:border-none-gray-700 rounded-lg  py-2 min-w-[120px]">
          {token ? (
            <div className="flex items-center">
              {token.symbol && (
                <Image
                  src={`/tokens/${token.symbol.toLowerCase()}.svg`}
                  alt={token.symbol}
                  className="w-6 h-6 mr-2 rounded-full"
                  width={24}
                  height={24}
                />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {token.symbol}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              Select token
            </span>
          )}
        </div>
        {address && token && (
          <div className="flex items-center text-sm">
            {isBalanceLoading ? (
              <Skeleton className="h-5 bg-fuchsia-950 w-20" />
            ) : (
              <span className="text-gray-500 dark:text-gray-400 mr-1">
                Balance: {!token.balance ? tokenBalnce : token.balance}{" "}
                {token.symbol}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start space-x-3">
        <div className="flex-0 w-full items-start text-start">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.0"
            disabled={disabled}
            className={`truncate appearance-none dark:text-slate-50   text-gray-900 w-full !ring-0 !outline-none min-h-[40px] h-[40px] py-2 border-0 bg-transparent p-0 py-1 !text-3xl font-medium flex-grow flex-1 !outline-none !ring-0 ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          />

          {/* Percentage buttons */}
          {address && tokenBalnce && !isBalanceLoading && (
            <div className="flex justify-end mt-2 space-x-2">
              {[25, 50, 75, 100].map((percent) => {
                const percentageValue = (
                  parseFloat(tokenBalnce || "0") *
                  (percent / 100)
                ).toFixed(6);

                return (
                  <Button
                    key={percent}
                    variant="secondary"
                    size="sm"
                    className={`px-2 py-1 text-xs font-semibold hover:bg-primary hover:!text-white ${
                      parseFloat(value) === parseFloat(percentageValue)
                        ? "bg-primary text-white"
                        : "bg-secondary"
                    }`}
                    onClick={() => {
                      onChange(percentageValue);
                    }}
                  >
                    {percent}%
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
