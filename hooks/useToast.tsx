"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { TransactionReceipt, TransactionResponse } from "ethers";
import {
  Link2Icon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  ClockIcon,
} from "lucide-react";
import { useTransactionStore } from "@/state/transactionStore";
import {
  PendingTransaction,
  TransactionType,
  TxToastOptions,
} from "@/lib/types";
import Image from "next/image";

// Types for transaction tracking

// Helper to get formatted title based on transaction type
const getTxTitle = (type: TransactionType, customTitle?: string): string => {
  if (customTitle) return customTitle;

  const titles: Record<TransactionType, string> = {
    swap: "Swap",
    addLiquidity: "Add Liquidity",
    removeLiquidity: "Remove Liquidity",
    approve: "Token Approval",
    stake: "Stake",
    faucet: "Faucet Tokens",
    unstake: "Unstake",
    claim: "Claim",
    bridge: "Bridge",
    other: "Transaction",
  };

  return titles[type] || "Transaction";
};

// Get the explorer URL based on chain ID
export function getExplorerUrl(chainId: number, txHash: string): string {
  const baseUrls: Record<number, string> = {
    1: "https://etherscan.io/tx/",
    5: "https://goerli.etherscan.io/tx/",
    11155111: "https://sepolia.etherscan.io/tx/",
    8453: "https://basescan.org/tx/",
    42161: "https://arbiscan.io/tx/",
    137: "https://polygonscan.com/tx/",
    421614: "https://sepolia.arbiscan.io/tx/",
    84531: "https://goerli.basescan.org/tx/",
    56: "https://bscscan.com/tx/",
    10: "https://optimistic.etherscan.io/tx/",
    43114: "https://snowtrace.io/tx/",
  };
  return `${baseUrls[chainId] || baseUrls[1]}${txHash}`;
}

// Transaction toast hook
export function useTxToast() {
  const { addTransaction, updateTransaction, removeTransaction } =
    useTransactionStore();

  /**
   * Show transaction toast with pending, success, and error states
   * @param txPromise - Promise that resolves to a transaction response
   * @param type - Type of transaction (swap, addLiquidity, etc.)
   * @param options - Configuration options
   * @param customTitle - Optional custom title to override the default
   */
  const showTxToast = async (
    txPromise: Promise<TransactionResponse>,
    type: TransactionType = "other",
    options?: TxToastOptions,
    customTitle?: string
  ): Promise<TransactionReceipt | null> => {
    const {
      actionLabel,
      onActionClick,
      chainId = 1,
      meta,
      onError,
      onSuccess,
      toastDuration = 20000,
      trackTransaction = true, // Default to tracking transactions
    } = options || {};

    const title = getTxTitle(type, customTitle);

    // Create a unique ID for this toast
    const toastId = toast.loading(`${title} submitted`, {
      description: "Waiting for confirmation...",
      icon: <LoaderIcon className="animate-spin" />,
      duration: toastDuration, // 1 minute timeout by default
    });

    try {
      // Wait for transaction to be mined
      const tx = await txPromise;

      // Add to pending transactions if tracking is enabled
      if (trackTransaction) {
        const pendingTx: PendingTransaction = {
          id: `${tx.hash}-${Date.now()}`,
          hash: tx.hash,
          type,
          title,
          chainId,
          meta,
          status: "pending",
          timestamp: Date.now(),
        };
        addTransaction(pendingTx);
      }

      // Update toast to show transaction is being processed
      toast.loading(`${title} processing`, {
        id: toastId,
        description: "Transaction is being processed on-chain",
        icon: <LoaderIcon className="animate-spin" />,
        duration: toastDuration, // 1 minute timeout
      });

      // If tracking is enabled, update the transaction status
      if (trackTransaction) {
        updateTransaction(tx.hash, { status: "processing" });
      }

      // Wait for confirmation (1 block)
      const receipt = await tx.wait(1);
      const explorer = getExplorerUrl(chainId, tx.hash);

      // Show success toast
      toast.success(`${title} successful`, {
        id: toastId,
        description: (
          <div className="flex flex-col gap-1">
            {meta && (
              <div className="flex items-center">
                {meta?.tokenAAmount && meta?.tokenBAmount && (
                  <>
                    {meta.tokenASymbol && (
                      <Image
                        src={`/tokens/${meta.tokenASymbol}`}
                        alt={meta.symbol || "symbol"}
                        className="inline-block w-4 h-4 mr-2"
                      />
                    )}
                    <span>{meta?.tokenAAmount}</span>
                    <span>{meta?.tokenASymbol}</span>
                    <span>{meta?.aggregate || "+"}</span>
                    {meta.tokenBSymbol && (
                      <Image
                        src={`/tokens/${meta.tokenBSymbol}`}
                        alt={meta.symbol || "symbol"}
                        className="inline-block w-4 h-4 mr-2"
                      />
                    )}
                    <span>{meta?.tokenBAmount}</span>
                    <span>{meta?.tokenBSymbol}</span>
                  </>
                )}
              </div>
            )}
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View on explorer <Link2Icon className="w-3 h-3" />
            </a>
          </div>
        ),
        action:
          actionLabel && onActionClick
            ? { label: actionLabel, onClick: onActionClick }
            : undefined,
        icon: <CheckCircleIcon className="text-green-500" />,
        duration: toastDuration, // 5 seconds for success
      });

      if (trackTransaction) {
        updateTransaction(tx.hash, { status: "success" });

        // Remove the success toast after the specified duration
        setTimeout(() => {
          toast.dismiss(toastId);
        }, toastDuration + 2500); // Add small buffer to ensure toast is fully displayed

        // Clean up the transaction store after a delay
        setTimeout(() => {
          updateTransaction(tx.hash, { status: "success" });
        }, toastDuration + 1000);
      }
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(receipt!);
      }
      setTimeout(() => {
        // Clear any remaining toasts related to this transaction
        toast.dismiss(toastId);

        // Reset transaction state if needed
        if (trackTransaction) {
          removeTransaction(receipt?.hash!); // Add this method to your transaction store
        }
      }, toastDuration + 2000); // Give enough time for the success toast to be seen

      return receipt;
    } catch (error: any) {
      console.error(`${title} Error:`, error);

      // Handle different types of errors
      let errorMsg = "Transaction failed";
      let txHash = error?.transactionHash || error?.receipt?.transactionHash;

      // If we have a transaction hash from the error but not explicitly defined
      if (!txHash && error?.transaction?.hash) {
        txHash = error.transaction.hash;
      }

      // Handle specific error types
      if (error?.code) {
        switch (error.code) {
          case "ACTION_REJECTED":
            errorMsg = "Transaction rejected by user";
            break;
          case "INSUFFICIENT_FUNDS":
            errorMsg = "Insufficient funds for transaction";
            break;
          case "UNPREDICTABLE_GAS_LIMIT":
            errorMsg = "Failed to estimate gas";
            break;
          case -32603:
            errorMsg = "Internal JSON-RPC error";
            break;
          case "CALL_EXCEPTION":
            errorMsg = error?.reason || "Contract call failed";
            break;
          case "NETWORK_ERROR":
            errorMsg = "Network connection error";
            break;
          default:
            errorMsg = error?.reason || error?.message || "Transaction failed";
        }
      }

      // Show error toast
      toast.error(`${title} failed`, {
        id: toastId,
        description: (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-red-600">{errorMsg}</span>
            {txHash && (
              <a
                href={getExplorerUrl(chainId, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View failed transaction <Link2Icon className="w-3 h-3" />
              </a>
            )}
          </div>
        ),
        icon: <XCircleIcon className="text-red-500" />,
        duration: 7000, // 7 seconds for errors
      });

      // If tracking is enabled and we have a transaction hash, update to failed status
      if (trackTransaction && txHash) {
        updateTransaction(txHash, { status: "failed" });
      }

      // Call error callback if provided
      if (onError) {
        onError(error);
      }

      throw error; // Re-throw to allow the calling code to handle it if needed
    }
  };

  /**
   * Wrapper function to handle contract calls with toast notifications
   * @param contractFn - Async function that performs the contract call
   * @param type - Transaction type
   * @param options - Toast options
   * @param customTitle - Optional custom title
   */
  const withToast = async <T extends TransactionResponse>(
    contractFn: () => Promise<T>,
    type: TransactionType = "other",
    options?: TxToastOptions,
    customTitle?: string
  ): Promise<TransactionReceipt | null> => {
    return showTxToast(contractFn(), type, options, customTitle);
  };

  return {
    showTxToast,
    withToast,
  };
}
