import { Pool } from "@/state/liquidityStore";
import React from "react";
import { FormatUsd } from "../Common/FormatUsd";
import { formatPercentage } from "@/lib/utils";
import { formatUSD } from "@/services/priceFeed";
import { CopyAddress } from "../Common/CopyAddress";

type Props = {
  pool: Pool;
  getUserPositionValue: () => number;
  address: any;
};

export const LiquidityDetails = ({
  pool,
  address,
  getUserPositionValue,
}: Props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-forground rounded-lg shadow-md col-span-1 p-6">
        <h2 className="text-lg font-medium mb-4">Pool Statistics</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Liquidity:</span>
            <span className="font-medium">
              {FormatUsd(
                parseFloat(pool.reserves0) * parseFloat(pool.token0Price) +
                  parseFloat(pool.reserves1) * parseFloat(pool.token1Price)
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Reserves:</span>
            <div className="text-right">
              <div>{`${parseFloat(pool.reserves0).toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })} ${pool.token0.symbol}`}</div>
              <div>{`${parseFloat(pool.reserves1).toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })} ${pool.token1.symbol}`}</div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Current Pool Price:</span>
            <div className="text-right">
              <div>{`1 ${pool.token0.symbol} = ${parseFloat(
                pool.token1Price
              ).toFixed(6)} ${pool.token1.symbol}`}</div>
              <div>{`1 ${pool.token1.symbol} = ${parseFloat(
                pool.token0Price
              ).toFixed(6)} ${pool.token0.symbol}`}</div>
            </div>
          </div>
        </div>
      </div>
      {address && (
        <>
          <div className="bg-forground rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Your Position</h2>
            {pool.userLpBalance && Number(pool.userLpBalance) > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Your Share:</span>
                  <span className="font-medium">
                    {formatPercentage(pool?.userLpBalance, pool?.totalSupply)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Position Value:</span>
                  <span className="font-medium">
                    {formatUSD(getUserPositionValue())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Your Tokens:</span>
                  <div className="text-right">
                    <div>{`${(
                      (parseFloat(pool.reserves0) *
                        parseFloat(pool.userLpBalance)) /
                      parseFloat(pool.totalSupply)
                    ).toFixed(6)} ${pool.token0.symbol}`}</div>
                    <div>{`${(
                      (parseFloat(pool.reserves1) *
                        parseFloat(pool.userLpBalance)) /
                      parseFloat(pool.totalSupply)
                    ).toFixed(6)} ${pool.token1.symbol}`}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">
                  You don't have a position in this pool yet.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      <div className="bg-forground rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium mb-4">Token Info</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between">
              <span className="text-gray-500">{pool.token0.symbol}:</span>
              <span className="font-mono flex gap-1 items-center">
                <CopyAddress address={pool.token0.address} />
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{pool.token0.name}</div>
          </div>
          <div>
            <div className="flex justify-between">
              <span className="text-gray-500">{pool.token1.symbol}:</span>
              <span className="font-mono flex gap-1 items-center">
                <CopyAddress address={pool.token1.address} />
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">{pool.token1.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
