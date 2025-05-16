"use client";

import { useEffect, useState } from "react";
// import { useTransactionStore } from "@/lib/hooks/useTxToast";
import {
  Link2Icon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
import { useTransactionStore } from "@/state/transactionStore";
import { getExplorerUrl } from "@/hooks/useToast";
import Image from "next/image";
// import { getExplorerUrl } from "@/lib/hooks/useTxToast";

export function PendingTransactions() {
  // const transactionToastData = {
  //   id: "0xdfea6088ea4bbd0d02b6d76365a27c04df18f0c2d9c06ad8d0eeac0bb27c5d50-1747383179382",
  //   hash: "0xdfea6088ea4bbd0d02b6d76365a27c04df18f0c2d9c06ad8d0eeac0bb27c5d50",
  //   chainId: 421614,
  //   type: "swap",
  //   title: "Swap RSTX for STX",
  //   status: "success",
  //   timestamp: 1747383179382,
  //   meta: {
  //     tokenAAmount: "1",
  //     tokenASymbol: "RSTX",
  //     tokenBAmount: "1.3291",
  //     tokenBSymbol: "STX",
  //     aggregate: "→",
  //   },
  // };

  const { pendingTransactions } = useTransactionStore();
  // const [pendingTransactions, setPendingTransactions] = useState<any>([
  //   transactionToastData,
  // ]);
  const [isOpen, setIsOpen] = useState(false);
  const pendingCount = pendingTransactions.length;
  // console.log({ pendingTransactions });

  // Auto-close if no pending transactions
  useEffect(() => {
    if (pendingCount === 0) {
      setIsOpen(false);
    }
  }, [pendingCount]);

  if (pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Transaction indicator button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-forground px-4 py-2  shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
        <span className="font-medium"> Trxns</span>
      </button>

      {/* Transactions panel */}
      {isOpen && (
        <div className="mt-2 w-80  bg-forgound  shadow-xl border border-border overflow-hidden">
          <div className="p-3 border-b border-border bg-forground flex justify-between items-center">
            <h3 className="font-medium">Recent Transactions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {pendingTransactions.map((tx: any) => (
              <div
                key={tx.id}
                className="p-3 border-b border-border bg-forground"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {tx.status === "pending" && (
                      <ClockIcon className="w-4 h-4 text-yellow-500" />
                    )}
                    {tx.status === "processing" && (
                      <ClockIcon className="w-4 h-4 text-blue-500 animate-pulse" />
                    )}
                    {tx.status === "success" && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    )}
                    {tx.status === "failed" && (
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{tx.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(tx.timestamp)}
                  </span>
                </div>

                {tx.meta && (
                  <div className="mb-1 flex items-center gap-1 text-sm text-title">
                    {tx.meta.tokenAAmount && (
                      <>
                        <span>{tx.meta.tokenAAmount}</span>
                        <Image
                          src={`/tokens/${tx.meta?.tokenASymbol?.toLowerCase()}.svg`}
                          alt={tx.meta.tokenASymbol || "token symbol"}
                          className="w-4 h-4 mr-1"
                          width={30}
                          height={30}
                        />
                        <span>{tx.meta.tokenASymbol}</span>
                      </>
                    )}
                    {tx.meta.aggregate}
                    {tx.meta.tokenBAmount && (
                      <>
                        <span>{tx.meta.tokenBAmount}</span>
                        <Image
                          src={`/tokens/${tx.meta?.tokenBSymbol?.toLowerCase()}.svg`}
                          alt={tx.meta.tokenBSymbol || "token symbol"}
                          className="w-4 h-4 mr-1"
                          width={30}
                          height={30}
                        />
                        <span>{tx.meta.tokenBSymbol}</span>
                      </>
                    )}
                  </div>
                )}

                <div className="mt-1">
                  <a
                    href={getExplorerUrl(tx.chainId, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}{" "}
                    <Link2Icon className="w-3 h-3" />
                  </a>
                </div>

                <div className="mt-2 text-xs">
                  {tx.status === "pending" && (
                    <span className="text-yellow-600">
                      Waiting for confirmation...
                    </span>
                  )}
                  {tx.status === "processing" && (
                    <span className="text-blue-600">
                      Processing on-chain...
                    </span>
                  )}
                  {tx.status === "success" && (
                    <span className="text-green-600">
                      Transaction confirmed
                    </span>
                  )}
                  {tx.status === "failed" && (
                    <span className="text-red-600">Transaction failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to format timestamps
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) {
    return "Just now";
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
}
