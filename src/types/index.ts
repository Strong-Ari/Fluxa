// Type definitions for Fluxa Offline app

/**
 * Screen type enumeration
 */
export type ScreenType = "dashboard" | "vault" | "radar" | "transaction" | "receipt";

/**
 * Transaction data passed between screens
 */
export interface TransactionData {
  amount: number;
  merchantName?: string;
  merchantImage?: string;
  transactionId?: string;
  timestamp?: string;
  signature?: string;
}

/**
 * Merchant information for radar screen
 */
export interface Merchant {
  id: string;
  name: string;
  image: string;
  distance: number; // 0-1 scale, closer to center = closer
  angle: number; // 0-360 degrees
}

/**
 * Wallet state interface
 */
export interface Wallet {
  onlineBalance: number;  // Balance synced with server
  offlineBalance: number; // Balance stored locally
}

/**
 * Screen navigation callback type
 */
export type NavigationCallback = (screen: ScreenType, data?: TransactionData) => void;

/**
 * Transaction step type for progress
 */
export type TransactionStep = "crypto" | "signature" | "ble";

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Rust backend command payloads
 */

export interface VaultSecurePayload {
  amount: number;
}

export interface TransactionPayload {
  amount: number;
  merchantId: string;
  merchantName: string;
}

export interface BLETransactionPayload {
  transactionId: string;
  merchantId: string;
  signature: string;
}

/**
 * UI State interfaces
 */

export interface DashboardState {
  isCloudMode: boolean;
  onlineBalance: number;
  offlineBalance: number;
}

export interface VaultState {
  selectedAmount: number;
  isSecuring: boolean;
  securityMessage: string;
}

export interface RadarState {
  merchants: Merchant[];
  selectedMerchant: Merchant | null;
  scanning: boolean;
}

export interface TransactionState {
  currentStep: TransactionStep;
  progress: number;
  isComplete: boolean;
}

export interface ReceiptState {
  isShared: boolean;
  timestamp: string;
}
