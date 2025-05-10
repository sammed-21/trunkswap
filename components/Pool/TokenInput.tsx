import { useState } from "react";
// import { useWalletStore } from "@/stores/walletStore";
// import { TokenInfo } from "@/types/tokens";
import { FormatUsd } from "../Common/FormatUsd";
import { useAccountState } from "@/state/accountStore";

interface TokenInputProps {
  label: string;
  token: any | null;
  value: string;
  onChange: (value: string) => void;
  usdValue: number | null;
  disabled?: boolean;
}

export default function TokenInput({
  label,
  token,
  value,
  onChange,
  usdValue,
  disabled = false,
}: TokenInputProps) {
  const { address } = useAccountState();
  const [showMax, setShowMax] = useState(false);

  // Function to handle max button click
  const handleMaxClick = () => {
    if (token?.balance) {
      onChange(token.balance);
    }
  };

  return (
    <div
      className="bg-gray-50 dark:bg-forground p-4 rounded-lg"
      onMouseEnter={() => setShowMax(true)}
      onMouseLeave={() => setShowMax(false)}
    >
      <div className="flex justify-between mb-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">
          {label}
        </label>
        {address && token && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 mr-1">
              Balance: {token.balance} {token.symbol}
            </span>
            {showMax && !disabled && (
              <button
                onClick={handleMaxClick}
                className="ml-2 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Token Selection */}
        <div className="flex items-center bg-white dark:bg-forground border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 min-w-[120px]">
          {token ? (
            <div className="flex items-center">
              {token.logoURI && (
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-6 h-6 mr-2 rounded-full"
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

        {/* Input Field */}
        <div className="flex-1">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.0"
            disabled={disabled}
            className={`w-full bg-white dark:bg-background border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-right text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          />
          {usdValue !== null && (
            <div className="text-right mt-1 text-sm text-gray-500 dark:text-gray-400">
              ≈ {FormatUsd(usdValue)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
