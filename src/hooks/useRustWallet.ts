import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface WalletData {
  id: string;
  online_balance: number;
  offline_balance: number;
  total_balance: number;
  created_at: string;
  last_updated: string;
}

export interface TransactionData {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  merchant_name: string;
  amount: number;
  timestamp: string;
  signature: string;
  tx_type: string;
  status: string;
}

export interface KeyPairData {
  public_key: string;
  private_key: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export const useRustWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initWallet();
  }, []);

  const initWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const walletRes = await invoke<ApiResponse<WalletData>>("init_wallet");
      if (walletRes.success && walletRes.data) {
        setWallet(walletRes.data);
      }

      const keyRes = await invoke<ApiResponse<string>>("get_public_key");
      if (keyRes.success && keyRes.data) {
        setPublicKey(keyRes.data);
      }

      const txRes = await invoke<ApiResponse<TransactionData[]>>("get_transactions");
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }

      setLoading(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Initialization error";
      setError(msg);
      setLoading(false);
    }
  }, []);

  const transferToVault = useCallback(async (amount: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await invoke<ApiResponse<WalletData>>("transfer_to_vault", { amount });

      if (!res.success) {
        throw new Error(res.error || "Transfer failed");
      }

      if (res.data) {
        setWallet(res.data);
      }

      setLoading(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transfer error";
      setError(msg);
      setLoading(false);
      return false;
    }
  }, []);

  const transferFromVault = useCallback(async (amount: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await invoke<ApiResponse<WalletData>>("transfer_from_vault", { amount });

      if (!res.success) {
        throw new Error(res.error || "Transfer failed");
      }

      if (res.data) {
        setWallet(res.data);
      }

      setLoading(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transfer error";
      setError(msg);
      setLoading(false);
      return false;
    }
  }, []);

  const createOfflineTransaction = useCallback(
    async (toWalletId: string, merchantName: string, amount: number) => {
      try {
        setLoading(true);
        setError(null);

        const res = await invoke<ApiResponse<TransactionData>>("create_offline_transaction", {
          toWalletId: toWalletId,
          merchantName: merchantName,
          amount,
        });

        if (!res.success) {
          throw new Error(res.error || "Transaction creation failed");
        }

        if (res.data) {
          setTransactions((prev) => [...prev, res.data!]);
          // Refresh wallet
          await refreshWallet();
        }

        setLoading(false);
        return res.data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction error";
        setError(msg);
        setLoading(false);
        return null;
      }
    },
    []
  );

  const createOnlineTransaction = useCallback(
    async (toWalletId: string, merchantName: string, amount: number) => {
      try {
        setLoading(true);
        setError(null);

        const res = await invoke<ApiResponse<TransactionData>>("create_online_transaction", {
          to_wallet_id: toWalletId,
          merchant_name: merchantName,
          amount,
        });

        if (!res.success) {
          throw new Error(res.error || "Transaction creation failed");
        }

        if (res.data) {
          setTransactions((prev) => [...prev, res.data!]);
          // Refresh wallet
          await refreshWallet();
        }

        setLoading(false);
        return res.data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction error";
        setError(msg);
        setLoading(false);
        return null;
      }
    },
    []
  );

  const confirmTransaction = useCallback(async (txId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await invoke<ApiResponse<TransactionData>>("confirm_transaction", { tx_id: txId });

      if (!res.success) {
        throw new Error(res.error || "Confirmation failed");
      }

      if (res.data) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === res.data!.id ? res.data! : t))
        );
      }

      setLoading(false);
      return res.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Confirmation error";
      setError(msg);
      setLoading(false);
      return null;
    }
  }, []);

  const cancelTransaction = useCallback(async (txId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await invoke<ApiResponse<WalletData>>("cancel_transaction", { tx_id: txId });

      if (!res.success) {
        throw new Error(res.error || "Cancellation failed");
      }

      if (res.data) {
        setWallet(res.data);
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: "cancelled" } : t))
        );
      }

      setLoading(false);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cancellation error";
      setError(msg);
      setLoading(false);
      return false;
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const walletRes = await invoke<ApiResponse<WalletData>>("get_wallet");
      if (walletRes.success && walletRes.data) {
        setWallet(walletRes.data);
      }

      const txRes = await invoke<ApiResponse<TransactionData[]>>("get_transactions");
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      const res = await invoke<ApiResponse<any>>("get_wallet_stats");
      return res.data;
    } catch (err) {
      console.error("Stats error:", err);
      return null;
    }
  }, []);

  return {
    wallet,
    transactions,
    publicKey,
    loading,
    error,
    initWallet,
    transferToVault,
    transferFromVault,
    createOfflineTransaction,
    createOnlineTransaction,
    confirmTransaction,
    cancelTransaction,
    refreshWallet,
    getStats,
  };
};
