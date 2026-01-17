/**
 * Fluxa Backend Configuration
 * Configuration centralisée pour tous les appels Rust/Tauri
 */

export const FLUXA_CONFIG = {
  // Commandes Tauri disponibles
  commands: {
    wallet: {
      init: "init_wallet",
      get: "get_wallet",
      stats: "get_wallet_stats",
      keys: {
        initialize: "initialize_keys",
        getPublic: "get_public_key",
      },
      transfer: {
        toVault: "transfer_to_vault",
        fromVault: "transfer_from_vault",
      },
    },
    transaction: {
      createOffline: "create_offline_transaction",
      createOnline: "create_online_transaction",
      confirm: "confirm_transaction",
      cancel: "cancel_transaction",
      getAll: "get_transactions",
      verify: "verify_tx_signature",
    },
  },

  // Validations
  validation: {
    minAmount: 100,
    maxAmount: 1000000,
    timeout: 30000, // 30s
  },

  // Messages
  messages: {
    success: {
      transferToVault: "Fonds transférés au coffre avec succès",
      transferFromVault: "Fonds retirés du coffre avec succès",
      transactionCreated: "Transaction créée",
      transactionConfirmed: "Transaction confirmée",
      transactionCancelled: "Transaction annulée",
    },
    error: {
      insufficientBalance: "Solde insuffisant",
      invalidAmount: "Montant invalide",
      networkError: "Erreur réseau",
      walletNotInitialized: "Portefeuille non initialisé",
      transactionFailed: "Erreur lors de la transaction",
    },
  },

  // États
  transactionStatus: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    FAILED: "failed",
    CANCELLED: "cancelled",
  },

  transactionType: {
    ONLINE: "online",
    OFFLINE: "offline",
    TRANSFER: "transfer",
  },
};

/**
 * Exemples d'utilisation
 */
export const EXAMPLES = {
  // Exemple 1: Récupérer le wallet
  getWallet: `
    import { invoke } from "@tauri-apps/api/core";

    const wallet = await invoke("get_wallet");
    console.log(wallet.online_balance); // 25000
  `,

  // Exemple 2: Transfert au vault
  transferToVault: `
    import { invoke } from "@tauri-apps/api/core";

    const result = await invoke("transfer_to_vault", { amount: 5000 });
    console.log(result.offline_balance); // Augmenté de 5000
  `,

  // Exemple 3: Créer une transaction P2P
  createOfflineTransaction: `
    import { invoke } from "@tauri-apps/api/core";

    const tx = await invoke("create_offline_transaction", {
      to_wallet_id: "wallet_123",
      merchant_name: "Chez Amenan",
      amount: 2000
    });
    console.log(tx.signature); // Signature cryptographique
  `,

  // Exemple 4: Hook personnalisé
  useWalletExample: `
    import { useRustWallet } from "@/hooks/useRustWallet";

    const MyComponent = () => {
      const { wallet, loading, error, transferToVault } = useRustWallet();

      const handleTransfer = async () => {
        await transferToVault(5000);
      };

      return (
        <div>
          {loading && <p>Chargement...</p>}
          {error && <p>{error}</p>}
          {wallet && (
            <>
              <p>Online: {wallet.online_balance}</p>
              <p>Offline: {wallet.offline_balance}</p>
              <button onClick={handleTransfer}>Transférer</button>
            </>
          )}
        </div>
      );
    };
  `,
};

export default FLUXA_CONFIG;
