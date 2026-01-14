import { useState, useCallback } from "react";

export interface Wallet {
  onlineBalance: number;
  offlineBalance: number;
}

export const useWallet = (initialOnline: number = 25000, initialOffline: number = 15000) => {
  const [wallet, setWallet] = useState<Wallet>({
    onlineBalance: initialOnline,
    offlineBalance: initialOffline,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferToVault = useCallback(
    (amount: number) => {
      setLoading(true);
      setError(null);

      try {
        // Validate amount
        if (amount <= 0) {
          throw new Error("Le montant doit être positif");
        }

        if (amount > wallet.onlineBalance) {
          throw new Error("Solde insuffisant");
        }

        setWallet((prev) => ({
          onlineBalance: prev.onlineBalance - amount,
          offlineBalance: prev.offlineBalance + amount,
        }));

        setLoading(false);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [wallet.onlineBalance]
  );

  const transferFromVault = useCallback(
    (amount: number) => {
      setLoading(true);
      setError(null);

      try {
        if (amount <= 0) {
          throw new Error("Le montant doit être positif");
        }

        if (amount > wallet.offlineBalance) {
          throw new Error("Solde coffre insuffisant");
        }

        setWallet((prev) => ({
          onlineBalance: prev.onlineBalance + amount,
          offlineBalance: prev.offlineBalance - amount,
        }));

        setLoading(false);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [wallet.offlineBalance]
  );

  return {
    wallet,
    loading,
    error,
    transferToVault,
    transferFromVault,
  };
};
