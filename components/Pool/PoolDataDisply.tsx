import { useAccountState } from "@/state/accountStore";
import { usePoolState } from "@/state/poolStore";
import React from "react";
import { Button } from "../ui/Button";

export const PoolPositionsList = () => {
  const { userPositions, isLoading, error } = usePoolState();
  const { chainId } = useAccountState();
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-lg animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading....</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">
          Error loading positions
        </h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <Button
          variant={"transparent"}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Not connected
  // if (!isConnected) {
  //   return (
  //     <div className="p-6 border rounded-lg">
  //       <div className="flex flex-col items-center justify-center py-8">
  //         <svg
  //           className="w-16 h-16 text-gray-400"
  //           fill="none"
  //           viewBox="0 0 24 24"
  //           stroke="currentColor"
  //         >
  //           <path
  //             strokeLinecap="round"
  //             strokeLinejoin="round"
  //             strokeWidth={2}
  //             d="M13 10V3L4 14h7v7l9-11h-7z"
  //           />
  //         </svg>
  //         <h3 className="mt-4 text-lg font-medium">Connect your wallet</h3>
  //         <p className="mt-2 text-sm text-gray-500">
  //           Connect your wallet to view your liquidity positions
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // No positions
  if (userPositions.length === 0) {
    return (
      <div className="p-6 border rounded-lg">
        <div className="flex flex-col items-center justify-center py-8">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium">
            No liquidity positions found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            You haven't added liquidity to any pools on{" "}
            {chainId === 421614 ? "Arbitrum Sepolia" : "this network"} yet
          </p>
          <Button
            variant={"transparent"}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              /* Navigate to add liquidity page */
            }}
          >
            Add Liquidity
          </Button>
        </div>
      </div>
    );
  }

  // Display positions
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Liquidity Positions</h2>

      {userPositions.map((position) => (
        <div
          key={position.pairAddress}
          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">
                {position.token0Symbol}/{position.token1Symbol}
              </h3>
              <p className="text-sm text-gray-500">
                Pair: {position.pairAddress.slice(0, 6)}...
                {position.pairAddress.slice(-4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                Your liquidity: {position.liquidity}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">{position.token0Symbol}</p>
              <p className="font-medium">{position.token0Amount}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">{position.token1Symbol}</p>
              <p className="font-medium">{position.token1Amount}</p>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <Button
              variant={"transparent"}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </Button>
            <Button
              variant={"transparent"}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
