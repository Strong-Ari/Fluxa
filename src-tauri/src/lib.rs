// Fluxa - Decentralized Payment System
// Wallet Management Module (Rust Backend)

use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;
use lazy_static::lazy_static;

// ========== TYPE DEFINITIONS ==========

/// Wallet state with online and offline balances
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallet {
    pub id: String,
    pub online_balance: u64,      // Cloud synchronized balance
    pub offline_balance: u64,     // Local vault balance
    pub total_balance: u64,
    pub created_at: String,
    pub last_updated: String,
}

/// Transaction record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub from_wallet_id: String,
    pub to_wallet_id: String,
    pub merchant_name: String,
    pub amount: u64,
    pub timestamp: String,
    pub signature: String,
    pub tx_type: String,
    pub status: String,
}

/// Cryptographic key pair
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyPair {
    pub public_key: String,
    pub private_key: String,
    pub created_at: String,
}

/// API Response wrapper
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: String,
}

// ========== BANKING ENGINE ==========

pub struct BankingEngine {
    wallet: Wallet,
    keypair: Option<KeyPair>,
    transactions: Vec<Transaction>,
}

impl BankingEngine {
    /// Initialize new wallet
    pub fn new() -> Self {
        let wallet_id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        BankingEngine {
            wallet: Wallet {
                id: wallet_id,
                online_balance: 25000,
                offline_balance: 15000,
                total_balance: 40000,
                created_at: now.clone(),
                last_updated: now,
            },
            keypair: None,
            transactions: Vec::new(),
        }
    }

    /// Initialize cryptographic keys
    pub fn initialize_keys(&mut self) -> Result<KeyPair, String> {
        let private_key_seed = Uuid::new_v4().to_string();
        let private_key = hex::encode(Sha256::digest(private_key_seed.as_bytes()));
        let public_key_data = format!("pub_{}", private_key);
        let public_key = hex::encode(Sha256::digest(public_key_data.as_bytes()));

        let key_pair = KeyPair {
            public_key,
            private_key,
            created_at: Utc::now().to_rfc3339(),
        };

        self.keypair = Some(key_pair.clone());
        Ok(key_pair)
    }

    /// Get wallet state
    pub fn get_wallet(&self) -> Wallet {
        self.wallet.clone()
    }

    /// Get public key
    pub fn get_public_key(&self) -> Result<String, String> {
        self.keypair
            .as_ref()
            .map(|kp| kp.public_key.clone())
            .ok_or("Keys not initialized".to_string())
    }

    /// Transfer funds to offline vault
    pub fn transfer_to_vault(&mut self, amount: u64) -> Result<Wallet, String> {
        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }

        if amount > self.wallet.online_balance {
            return Err("Insufficient online balance".to_string());
        }

        self.wallet.online_balance -= amount;
        self.wallet.offline_balance += amount;
        self.wallet.total_balance =
            self.wallet.online_balance + self.wallet.offline_balance;
        self.wallet.last_updated = Utc::now().to_rfc3339();

        // Log transaction
        let tx = Transaction {
            id: Uuid::new_v4().to_string(),
            from_wallet_id: self.wallet.id.clone(),
            to_wallet_id: self.wallet.id.clone(),
            merchant_name: "Vault Transfer".to_string(),
            amount,
            timestamp: Utc::now().to_rfc3339(),
            signature: String::new(),
            tx_type: "transfer".to_string(),
            status: "confirmed".to_string(),
        };

        self.transactions.push(tx);
        Ok(self.wallet.clone())
    }

    /// Transfer funds from offline vault to online
    pub fn transfer_from_vault(&mut self, amount: u64) -> Result<Wallet, String> {
        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }

        if amount > self.wallet.offline_balance {
            return Err("Insufficient vault balance".to_string());
        }

        self.wallet.offline_balance -= amount;
        self.wallet.online_balance += amount;
        self.wallet.total_balance =
            self.wallet.online_balance + self.wallet.offline_balance;
        self.wallet.last_updated = Utc::now().to_rfc3339();

        // Log transaction
        let tx = Transaction {
            id: Uuid::new_v4().to_string(),
            from_wallet_id: self.wallet.id.clone(),
            to_wallet_id: self.wallet.id.clone(),
            merchant_name: "Vault Withdrawal".to_string(),
            amount,
            timestamp: Utc::now().to_rfc3339(),
            signature: String::new(),
            tx_type: "transfer".to_string(),
            status: "confirmed".to_string(),
        };

        self.transactions.push(tx);
        Ok(self.wallet.clone())
    }

    /// Create offline transaction (P2P)
    pub fn create_offline_transaction(
        &mut self,
        to_wallet_id: String,
        merchant_name: String,
        amount: u64,
    ) -> Result<Transaction, String> {
        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }

        if amount > self.wallet.offline_balance {
            return Err("Insufficient offline balance".to_string());
        }

        let keypair = self.keypair.as_ref()
            .ok_or("Keys not initialized")?;

        let tx_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now().to_rfc3339();

        // Create transaction data and sign
        let tx_data = format!(
            "{}|{}|{}|{}|{}",
            tx_id, self.wallet.id, to_wallet_id, amount, timestamp
        );

        let signature = self.sign_data(&tx_data, keypair)?;

        // Deduct from offline balance
        self.wallet.offline_balance -= amount;
        self.wallet.total_balance =
            self.wallet.online_balance + self.wallet.offline_balance;
        self.wallet.last_updated = Utc::now().to_rfc3339();

        let transaction = Transaction {
            id: tx_id,
            from_wallet_id: self.wallet.id.clone(),
            to_wallet_id,
            merchant_name,
            amount,
            timestamp,
            signature,
            tx_type: "offline".to_string(),
            status: "pending".to_string(),
        };

        self.transactions.push(transaction.clone());
        Ok(transaction)
    }

    /// Create online transaction (server validated)
    pub fn create_online_transaction(
        &mut self,
        to_wallet_id: String,
        merchant_name: String,
        amount: u64,
    ) -> Result<Transaction, String> {
        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }

        if amount > self.wallet.online_balance {
            return Err("Insufficient online balance".to_string());
        }

        let keypair = self.keypair.as_ref()
            .ok_or("Keys not initialized")?;

        let tx_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now().to_rfc3339();

        let tx_data = format!(
            "{}|{}|{}|{}|{}",
            tx_id, self.wallet.id, to_wallet_id, amount, timestamp
        );

        let signature = self.sign_data(&tx_data, keypair)?;

        // Optimistic deduction
        self.wallet.online_balance -= amount;
        self.wallet.total_balance =
            self.wallet.online_balance + self.wallet.offline_balance;
        self.wallet.last_updated = Utc::now().to_rfc3339();

        let transaction = Transaction {
            id: tx_id,
            from_wallet_id: self.wallet.id.clone(),
            to_wallet_id,
            merchant_name,
            amount,
            timestamp,
            signature,
            tx_type: "online".to_string(),
            status: "pending".to_string(),
        };

        self.transactions.push(transaction.clone());
        Ok(transaction)
    }

    /// Confirm transaction after server validation
    pub fn confirm_transaction(&mut self, tx_id: String) -> Result<Transaction, String> {
        let tx = self.transactions.iter_mut()
            .find(|t| t.id == tx_id)
            .ok_or("Transaction not found")?;

        tx.status = "confirmed".to_string();
        Ok(tx.clone())
    }

    /// Cancel transaction and revert balance
    pub fn cancel_transaction(&mut self, tx_id: String) -> Result<Wallet, String> {
        let tx = self.transactions.iter_mut()
            .find(|t| t.id == tx_id)
            .ok_or("Transaction not found")?;

        if tx.status == "confirmed" {
            return Err("Cannot cancel confirmed transaction".to_string());
        }

        // Revert balance
        if tx.tx_type == "online" {
            self.wallet.online_balance += tx.amount;
        } else if tx.tx_type == "offline" {
            self.wallet.offline_balance += tx.amount;
        }

        self.wallet.total_balance =
            self.wallet.online_balance + self.wallet.offline_balance;
        self.wallet.last_updated = Utc::now().to_rfc3339();

        tx.status = "cancelled".to_string();
        Ok(self.wallet.clone())
    }

    /// Get all transactions
    pub fn get_transactions(&self) -> Vec<Transaction> {
        self.transactions.clone()
    }

    /// Get transactions by type
    pub fn get_transactions_by_type(&self, tx_type: &str) -> Vec<Transaction> {
        self.transactions.iter()
            .filter(|t| t.tx_type == tx_type)
            .cloned()
            .collect()
    }

    /// Get transactions by status
    pub fn get_transactions_by_status(&self, status: &str) -> Vec<Transaction> {
        self.transactions.iter()
            .filter(|t| t.status == status)
            .cloned()
            .collect()
    }

    /// Sign data with private key
    fn sign_data(&self, data: &str, keypair: &KeyPair) -> Result<String, String> {
        let combined = format!("{}|{}", data, keypair.private_key);
        let hash = Sha256::digest(combined.as_bytes());
        Ok(hex::encode(hash))
    }

    /// Verify signature
    pub fn verify_signature(
        &self,
        data: &str,
        signature: &str,
    ) -> Result<bool, String> {
        // Retrieve the keypair to verify
        let keypair = self.keypair.as_ref()
            .ok_or("Keys not initialized")?;

        // Recalculate expected signature
        let combined = format!("{}|{}", data, keypair.private_key);
        let expected_hash = Sha256::digest(combined.as_bytes());
        let expected_signature = hex::encode(expected_hash);

        Ok(signature == expected_signature)
    }

    /// Get wallet statistics
    pub fn get_stats(&self) -> serde_json::Value {
        let confirmed_count = self.transactions.iter()
            .filter(|t| t.status == "confirmed")
            .count();
        let total_volume: u64 = self.transactions.iter()
            .filter(|t| t.status == "confirmed")
            .map(|t| t.amount)
            .sum();

        serde_json::json!({
            "total_transactions": self.transactions.len(),
            "confirmed_transactions": confirmed_count,
            "total_volume": total_volume,
            "wallet_id": self.wallet.id,
            "created_at": self.wallet.created_at,
        })
    }
}

// Global state (thread-safe)
lazy_static! {
    static ref BANKING_ENGINE: Mutex<BankingEngine> = Mutex::new(BankingEngine::new());
}

// ========== TAURI COMMANDS ==========

#[tauri::command]
fn init_wallet() -> ApiResponse<Wallet> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    if engine.keypair.is_none() {
        let _ = engine.initialize_keys();
    }

    let wallet = engine.get_wallet();
    ApiResponse {
        success: true,
        data: Some(wallet),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
fn get_wallet() -> ApiResponse<Wallet> {
    let engine = BANKING_ENGINE.lock().unwrap();
    let wallet = engine.get_wallet();
    ApiResponse {
        success: true,
        data: Some(wallet),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
fn initialize_keys() -> ApiResponse<KeyPair> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.initialize_keys() {
        Ok(keys) => ApiResponse {
            success: true,
            data: Some(keys),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn get_public_key() -> ApiResponse<String> {
    let engine = BANKING_ENGINE.lock().unwrap();
    match engine.get_public_key() {
        Ok(key) => ApiResponse {
            success: true,
            data: Some(key),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn transfer_to_vault(amount: u64) -> ApiResponse<Wallet> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.transfer_to_vault(amount) {
        Ok(wallet) => ApiResponse {
            success: true,
            data: Some(wallet),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn transfer_from_vault(amount: u64) -> ApiResponse<Wallet> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.transfer_from_vault(amount) {
        Ok(wallet) => ApiResponse {
            success: true,
            data: Some(wallet),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn create_offline_transaction(
    to_wallet_id: String,
    merchant_name: String,
    amount: u64,
) -> ApiResponse<Transaction> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.create_offline_transaction(to_wallet_id, merchant_name, amount) {
        Ok(tx) => ApiResponse {
            success: true,
            data: Some(tx),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn create_online_transaction(
    to_wallet_id: String,
    merchant_name: String,
    amount: u64,
) -> ApiResponse<Transaction> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.create_online_transaction(to_wallet_id, merchant_name, amount) {
        Ok(tx) => ApiResponse {
            success: true,
            data: Some(tx),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn confirm_transaction(tx_id: String) -> ApiResponse<Transaction> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.confirm_transaction(tx_id) {
        Ok(tx) => ApiResponse {
            success: true,
            data: Some(tx),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn cancel_transaction(tx_id: String) -> ApiResponse<Wallet> {
    let mut engine = BANKING_ENGINE.lock().unwrap();
    match engine.cancel_transaction(tx_id) {
        Ok(wallet) => ApiResponse {
            success: true,
            data: Some(wallet),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

#[tauri::command]
fn get_transactions() -> ApiResponse<Vec<Transaction>> {
    let engine = BANKING_ENGINE.lock().unwrap();
    let transactions = engine.get_transactions();
    ApiResponse {
        success: true,
        data: Some(transactions),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
fn get_wallet_stats() -> ApiResponse<serde_json::Value> {
    let engine = BANKING_ENGINE.lock().unwrap();
    let stats = engine.get_stats();
    ApiResponse {
        success: true,
        data: Some(stats),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
fn verify_tx_signature(
    data: String,
    signature: String,
) -> ApiResponse<bool> {
    let engine = BANKING_ENGINE.lock().unwrap();
    match engine.verify_signature(&data, &signature) {
        Ok(valid) => ApiResponse {
            success: true,
            data: Some(valid),
            error: None,
            timestamp: Utc::now().to_rfc3339(),
        },
        Err(e) => ApiResponse {
            success: false,
            data: None,
            error: Some(e),
            timestamp: Utc::now().to_rfc3339(),
        },
    }
}

// ========== P2P NFC & BLUETOOTH COMMANDS ==========

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct P2PTransaction {
    pub id: String,
    pub sender_wallet_id: String,
    pub receiver_wallet_id: String,
    pub amount: u64,
    pub signature: String,
    pub timestamp: String,
    pub status: String,
}

/// NFC: Check if NFC is available on device
#[tauri::command]
async fn nfc_is_available() -> ApiResponse<bool> {
    // On Android/iOS: tauri-plugin-nfc will check availability
    // For now, return true assuming mobile platform
    let available = cfg!(target_os = "android") || cfg!(target_os = "ios");

    ApiResponse {
        success: true,
        data: Some(available),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

/// NFC: Send transaction via NFC tag
#[tauri::command]
async fn nfc_send_transaction(
    receiver_id: String,
    amount: u64,
) -> ApiResponse<String> {
    let engine = BANKING_ENGINE.lock().unwrap();

    // Validate amount
    if amount < 100 || amount > 1_000_000 {
        return ApiResponse {
            success: false,
            data: None,
            error: Some("Montant invalide (100 - 1M FCFA)".to_string()),
            timestamp: Utc::now().to_rfc3339(),
        };
    }

    if amount > engine.wallet.offline_balance {
        return ApiResponse {
            success: false,
            data: None,
            error: Some("Solde offline insuffisant".to_string()),
            timestamp: Utc::now().to_rfc3339(),
        };
    }

    // Create transaction to write to NFC tag
    let tx_id = Uuid::new_v4().to_string();
    let wallet = &engine.wallet;

    // Payload to be written to NFC (handled by frontend plugin)
    let nfc_payload = serde_json::json!({
        "tx_id": tx_id.clone(),
        "sender": wallet.id,
        "receiver": receiver_id,
        "amount": amount,
        "timestamp": Utc::now().to_rfc3339(),
        "signature": format!("sig_{}", hex::encode(Sha256::digest(format!("{}{}{}", wallet.id, receiver_id, amount).as_bytes())))
    }).to_string();

    ApiResponse {
        success: true,
        data: Some(format!("NFC transaction prepared: {} | Payload size: {} bytes", tx_id, nfc_payload.len())),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

/// NFC: Receive transaction from NFC tag
#[tauri::command]
async fn nfc_receive_transaction() -> ApiResponse<P2PTransaction> {
    // Placeholder: In production, would read from actual NFC tag via plugin
    let tx = P2PTransaction {
        id: Uuid::new_v4().to_string(),
        sender_wallet_id: "wallet_sender".to_string(),
        receiver_wallet_id: "wallet_receiver".to_string(),
        amount: 5000,
        signature: "sig_placeholder".to_string(),
        timestamp: Utc::now().to_rfc3339(),
        status: "pending".to_string(),
    };

    ApiResponse {
        success: true,
        data: Some(tx),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BluetoothDevice {
    pub id: String,
    pub name: String,
    pub rssi: i32,
}

/// Bluetooth: Scan for nearby devices
#[tauri::command]
async fn bluetooth_scan_devices() -> ApiResponse<Vec<BluetoothDevice>> {
    // Simulated BLE scan on mobile
    // In production: use native Bluetooth APIs (Android: BluetoothAdapter, iOS: CBCentralManager)
    let devices = vec![
        BluetoothDevice {
            id: "device_001".to_string(),
            name: "📱 Téléphone d'Amenan".to_string(),
            rssi: -45,
        },
        BluetoothDevice {
            id: "device_002".to_string(),
            name: "📱 iPhone de Kofi".to_string(),
            rssi: -62,
        },
    ];

    ApiResponse {
        success: true,
        data: Some(devices),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

/// Bluetooth: Connect to device
#[tauri::command]
async fn bluetooth_connect(_device_id: String) -> ApiResponse<bool> {
    // Simulated connection (real implementation uses native Android/iOS BLE APIs)
    // In production: establish actual BLE connection and discover services/characteristics
    ApiResponse {
        success: true,
        data: Some(true),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}

/// Bluetooth: Send transaction over BLE
#[tauri::command]
async fn bluetooth_send_transaction(
    device_id: String,
    _receiver_id: String,
    amount: u64,
) -> ApiResponse<String> {
    let engine = BANKING_ENGINE.lock().unwrap();
    let wallet = &engine.wallet;

    // Validate amount
    if amount < 100 || amount > 1_000_000 {
        return ApiResponse {
            success: false,
            data: None,
            error: Some("Montant invalide (100 - 1M FCFA)".to_string()),
            timestamp: Utc::now().to_rfc3339(),
        };
    }

    if amount > wallet.offline_balance {
        return ApiResponse {
            success: false,
            data: None,
            error: Some("Solde offline insuffisant".to_string()),
            timestamp: Utc::now().to_rfc3339(),
        };
    }

    // Create BLE transaction
    let tx_id = Uuid::new_v4().to_string();
    let _payload = serde_json::json!({
        "tx_id": tx_id.clone(),
        "sender": wallet.id,
        "receiver": device_id,
        "amount": amount,
        "timestamp": Utc::now().to_rfc3339(),
    }).to_string();

    // In production: Send payload over BLE characteristic
    ApiResponse {
        success: true,
        data: Some(format!("BLE transaction sent: {}", tx_id)),
        error: None,
        timestamp: Utc::now().to_rfc3339(),
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_blec::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            init_wallet,
            get_wallet,
            initialize_keys,
            get_public_key,
            transfer_to_vault,
            transfer_from_vault,
            create_offline_transaction,
            create_online_transaction,
            confirm_transaction,
            cancel_transaction,
            get_transactions,
            get_wallet_stats,
            verify_tx_signature,
            nfc_send_transaction,
            nfc_receive_transaction,
            nfc_is_available,
            bluetooth_scan_devices,
            bluetooth_connect,
            bluetooth_send_transaction,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
