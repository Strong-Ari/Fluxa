export const FLUXA_CONFIG = {
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

  validation: {
    minAmount: 100,
    maxAmount: 1000000,
    timeout: 30000,
  },

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

export default FLUXA_CONFIG;
