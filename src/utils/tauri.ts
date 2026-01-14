import { invoke } from "@tauri-apps/api/core";

export interface TransactionPayload {
  amount: number;
  merchantId: string;
  merchantName: string;
}

export interface VaultSecurePayload {
  amount: number;
}

/**
 * Invokes the Rust backend to secure funds in local vault
 */
export async function secureVaultFunds(amount: number): Promise<string> {
  try {
    return await invoke("secure_vault_funds", { amount });
  } catch (error) {
    console.error("Error securing vault funds:", error);
    throw error;
  }
}

/**
 * Invokes Rust Bluetooth scan to find merchants
 */
export async function scanBluetoothMerchants(): Promise<any[]> {
  try {
    return await invoke("scan_merchants");
  } catch (error) {
    console.error("Error scanning merchants:", error);
    throw error;
  }
}

/**
 * Invokes Rust backend to create transaction
 */
export async function initiateTransaction(
  payload: TransactionPayload
): Promise<{ transactionId: string; signature: string }> {
  try {
    return await invoke("create_transaction", payload);
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

/**
 * Invokes Rust backend to sign transaction with Ed25519
 */
export async function signTransaction(transactionId: string): Promise<string> {
  try {
    return await invoke("sign_transaction", { transactionId });
  } catch (error) {
    console.error("Error signing transaction:", error);
    throw error;
  }
}

/**
 * Invokes Rust backend to send transaction via BLE
 */
export async function sendTransactionViaBLE(
  transactionId: string,
  merchantId: string
): Promise<boolean> {
  try {
    return await invoke("send_via_ble", { transactionId, merchantId });
  } catch (error) {
    console.error("Error sending via BLE:", error);
    throw error;
  }
}

/**
 * Get local wallet balance
 */
export async function getLocalBalance(): Promise<number> {
  try {
    return await invoke("get_local_balance");
  } catch (error) {
    console.error("Error getting local balance:", error);
    throw error;
  }
}

/**
 * Get online balance from server
 */
export async function getOnlineBalance(): Promise<number> {
  try {
    return await invoke("get_online_balance");
  } catch (error) {
    console.error("Error getting online balance:", error);
    throw error;
  }
}
