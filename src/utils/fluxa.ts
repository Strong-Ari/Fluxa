import { invoke } from "@tauri-apps/api/core";

interface InvokeOptions {
  timeout?: number;
  retry?: number;
}

const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY = 1;

export async function invokeCommand<T>(
  command: string,
  args?: Record<string, any>,
  options: InvokeOptions = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retry = DEFAULT_RETRY } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retry; attempt++) {
    try {
      const invokePromise = invoke<T>(command, args);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Command timeout: ${command}`)),
          timeout
        )
      );

      const result = await Promise.race([invokePromise, timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === retry - 1) {
        throw lastError;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError;
}

export const rustWalletAPI = {
  async getWallet() {
    return invokeCommand<any>("get_wallet");
  },

  async initWallet() {
    return invokeCommand<any>("init_wallet");
  },

  async getStats() {
    return invokeCommand<any>("get_wallet_stats");
  },

  async initializeKeys() {
    return invokeCommand<any>("initialize_keys");
  },

  async getPublicKey() {
    return invokeCommand<string>("get_public_key");
  },

  async transferToVault(amount: number) {
    return invokeCommand<any>("transfer_to_vault", { amount });
  },

  async transferFromVault(amount: number) {
    return invokeCommand<any>("transfer_from_vault", { amount });
  },

  async createOfflineTransaction(
    toWalletId: string,
    merchantName: string,
    amount: number
  ) {
    return invokeCommand<any>("create_offline_transaction", {
      to_wallet_id: toWalletId,
      merchant_name: merchantName,
      amount,
    });
  },

  async createOnlineTransaction(
    toWalletId: string,
    merchantName: string,
    amount: number
  ) {
    return invokeCommand<any>("create_online_transaction", {
      to_wallet_id: toWalletId,
      merchant_name: merchantName,
      amount,
    });
  },

  async confirmTransaction(txId: string) {
    return invokeCommand<any>("confirm_transaction", { tx_id: txId });
  },

  async cancelTransaction(txId: string) {
    return invokeCommand<any>("cancel_transaction", { tx_id: txId });
  },

  async getTransactions() {
    return invokeCommand<any[]>("get_transactions");
  },

  async verifySignature(data: string, signature: string) {
    return invokeCommand<boolean>("verify_tx_signature", { data, signature });
  },
};

export function validateAmount(amount: number, min = 100, max = 1000000): string | null {
  if (!Number.isInteger(amount) || amount <= 0) {
    return "Amount must be a positive integer";
  }
  if (amount < min) {
    return `Minimum amount is ${min}`;
  }
  if (amount > max) {
    return `Maximum amount is ${max}`;
  }
  return null;
}

export function validateWalletId(id: string): string | null {
  if (!id || typeof id !== "string") {
    return "Invalid wallet ID";
  }
  if (id.length < 5) {
    return "Wallet ID must be at least 5 characters";
  }
  return null;
}

export function validateMerchantName(name: string): string | null {
  if (!name || typeof name !== "string") {
    return "Invalid merchant name";
  }
  if (name.length < 2) {
    return "Merchant name must be at least 2 characters";
  }
  if (name.length > 100) {
    return "Merchant name must be less than 100 characters";
  }
  return null;
}

export const formatters = {
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  },

  formatDate: (timestamp: string): string => {
    return new Date(timestamp).toLocaleString("fr-FR");
  },

  formatTransactionType: (type: string): string => {
    switch (type) {
      case "online":
        return "🌐 En ligne";
      case "offline":
        return "📱 P2P";
      case "transfer":
        return "↔️ Transfert";
      default:
        return type;
    }
  },

  formatTransactionStatus: (status: string): string => {
    switch (status) {
      case "confirmed":
        return "✓ Confirmée";
      case "pending":
        return "⏳ En attente";
      case "failed":
        return "✗ Échouée";
      case "cancelled":
        return "⊘ Annulée";
      default:
        return status;
    }
  },
};

export class FluxaError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = "FluxaError";
  }
}

export function handleFluxaError(error: any): FluxaError {
  if (error instanceof FluxaError) {
    return error;
  }

  const message = error?.message || "Unknown error";

  if (message.includes("timeout")) {
    return new FluxaError("TIMEOUT", "Operation timed out", error);
  }

  if (message.includes("Insufficient")) {
    return new FluxaError("INSUFFICIENT_BALANCE", message, error);
  }

  if (message.includes("not found")) {
    return new FluxaError("NOT_FOUND", message, error);
  }

  return new FluxaError("UNKNOWN", message, error);
}

export default {
  invokeCommand,
  rustWalletAPI,
  validateAmount,
  validateWalletId,
  validateMerchantName,
  formatters,
  FluxaError,
  handleFluxaError,
};
