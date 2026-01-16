import { useEffect, useState } from "react";
import { useRustWallet } from "../hooks/useRustWallet";

interface WalletInitializerProps {
  children: React.ReactNode;
}

export const WalletInitializer: React.FC<WalletInitializerProps> = ({ children }) => {
  const { wallet, loading, error } = useRustWallet();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading && wallet) {
      setIsReady(true);
    }
  }, [loading, wallet]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold-royal mx-auto mb-4"></div>
          <p className="text-gray-400">Initialisation du portefeuille...</p>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur d'initialisation</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gold-royal text-space-dark rounded hover:bg-yellow-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark">
        <p className="text-gray-400">Chargement...</p>
      </div>
    );
  }

  return <>{children}</>;
};
