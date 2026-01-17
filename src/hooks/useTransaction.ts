import { useState, useCallback } from "react";
import { useRustWallet } from "./useRustWallet";

export interface TransactionState {
  amount: number;
  merchantId: string;
  merchantName: string;
  status: "pending" | "processing" | "completed" | "failed";
  transactionId?: string;
  signature?: string;
}

export const useTransaction = () => {
  const { createOfflineTransaction, createOnlineTransaction, confirmTransaction, cancelTransaction } = useRustWallet();
  const [transaction, setTransaction] = useState<TransactionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /// Create offline (P2P) transaction
  const initiateOfflineTransaction = useCallback(
    async (merchantId: string, merchantName: string, amount: number) => {
      try {
        setLoading(true);
        setError(null);

        const tx = await createOfflineTransaction(merchantId, merchantName, amount);

        if (!tx) {
          throw new Error("Transaction creation failed");
        }

        setTransaction({
          amount,
          merchantId,
          merchantName,
          status: "pending",
          transactionId: tx.id,
          signature: tx.signature,
        });

        setLoading(false);
        return tx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction error";
        setError(msg);
        setLoading(false);
        return null;
      }
    },
    [createOfflineTransaction]
  );

  /// Create online transaction
  const initiateOnlineTransaction = useCallback(
    async (merchantId: string, merchantName: string, amount: number) => {
      try {
        setLoading(true);
        setError(null);

        const tx = await createOnlineTransaction(merchantId, merchantName, amount);

        if (!tx) {
          throw new Error("Transaction creation failed");
        }

        setTransaction({
          amount,
          merchantId,
          merchantName,
          status: "processing",
          transactionId: tx.id,
          signature: tx.signature,
        });

        setLoading(false);
        return tx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction error";
        setError(msg);
        setLoading(false);
        return null;
      }
    },
    [createOnlineTransaction]
  );

  /// Confirm transaction
  const confirmTx = useCallback(
    async (txId: string) => {
      try {
        setLoading(true);
        setError(null);

        const tx = await confirmTransaction(txId);

        if (tx) {
          setTransaction((prev) =>
            prev ? { ...prev, status: "completed" } : null
          );
        }

        setLoading(false);
        return tx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Confirmation error";
        setError(msg);
        setLoading(false);
        return null;
      }
    },
    [confirmTransaction]
  );

  /// Cancel transaction
  const cancelTx = useCallback(
    async (txId: string) => {
      try {
        setLoading(true);
        setError(null);

        const success = await cancelTransaction(txId);

        if (success) {
          setTransaction((prev) =>
            prev ? { ...prev, status: "failed" } : null
          );
        }

        setLoading(false);
        return success;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cancellation error";
        setError(msg);
        setLoading(false);
        return false;
      }
    },
    [cancelTransaction]
  );

  /// Reset transaction
  const resetTransaction = useCallback(() => {
    setTransaction(null);
    setError(null);
  }, []);

  return {
    transaction,
    loading,
    error,
    initiateOfflineTransaction,
    initiateOnlineTransaction,
    confirmTx,
    cancelTx,
    resetTransaction,
  };
};
