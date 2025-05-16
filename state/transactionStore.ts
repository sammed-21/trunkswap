import { PendingTransaction } from "@/lib/types";
import { create } from "zustand";

// Transaction store with Zustand
interface TransactionStore {
  pendingTransactions: PendingTransaction[];
  addTransaction: (tx: PendingTransaction) => void;
  updateTransaction: (
    hash: string,
    updates: Partial<PendingTransaction>
  ) => void;
  removeTransaction: (hash: string) => void;
  clearAllTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  pendingTransactions: [],
  addTransaction: (tx) =>
    set((state) => ({
      pendingTransactions: [tx, ...state.pendingTransactions],
    })),
  updateTransaction: (hash, updates) =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions.map((tx) =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
    })),
  removeTransaction: (hash) =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter(
        (tx) => tx.hash !== hash
      ),
    })),
  clearAllTransactions: () => set({ pendingTransactions: [] }),
}));
