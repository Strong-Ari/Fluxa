import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
}

export interface P2PTransaction {
  id: string;
  sender_wallet_id: string;
  receiver_wallet_id: string;
  amount: number;
  signature: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

/**
 * Hook pour gérer NFC et Bluetooth via Rust backend
 * - NFC: Les vrais tag writes/reads se font via tauri-plugin-nfc côté frontend
 * - Bluetooth: Utilise les commandes Rust BLE
 */
export const useBluetoothNFC = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedTransaction, setReceivedTransaction] = useState<P2PTransaction | null>(null);
  const [nfcAvailable, setNfcAvailable] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);

  // ========== NFC FUNCTIONS ==========

  // Vérifier si NFC est disponible
  const checkNfcAvailability = useCallback(async () => {
    try {
      const result = await invoke<any>("nfc_is_available");
      const isAvailable = result.data ?? result.success ?? false;
      setNfcAvailable(isAvailable);
      return isAvailable;
    } catch (err) {
      console.warn("NFC non disponible:", err);
      setNfcAvailable(false);
      return false;
    }
  }, []);

  // Envoyer via NFC (préparer et écrire sur tag)
  const sendTransactionNFC = useCallback(
    async (receiverId: string, amount: number) => {
      setError(null);

      try {
        // 1. Préparer la transaction via Rust backend
        const prepareResult = await invoke<any>("nfc_send_transaction", {
          receiver_id: receiverId,
          amount,
        });

        if (!prepareResult.success) {
          throw new Error(prepareResult.error || "Failed to prepare NFC transaction");
        }

        // 2. Écrire sur le tag NFC via le plugin réel
        // NOTE: Cette partie nécessite l'utilisation directe du plugin dans le composant
        // car les APIs de tauri-plugin-nfc ne sont pas disponibles au niveau du hook
        setNfcScanning(true);

        // Pour maintenant, simuler l'écriture
        const payload = {
          receiverId,
          amount,
          timestamp: new Date().toISOString(),
          type: "fluxa_payment",
        };

        console.log("NFC Payload prepared:", payload);

        setNfcScanning(false);
        return {
          success: true,
          message: `Transaction ${amount} FCFA prête pour NFC à ${receiverId}`,
          payload,
        };
      } catch (err) {
        setError(String(err));
        setNfcScanning(false);
        console.error("NFC Send Error:", err);
        return {
          success: false,
          message: String(err),
        };
      }
    },
    []
  );

  // Recevoir via NFC (lire depuis tag)
  const receiveTransactionNFC = useCallback(async () => {
    setError(null);
    setNfcScanning(true);

    try {
      // Appeler le backend pour valider et recevoir la transaction
      const result = await invoke<any>("nfc_receive_transaction");

      if (result.success && result.data) {
        setReceivedTransaction(result.data);
        setNfcScanning(false);
        return {
          success: true,
          data: result.data,
          message: `Paiement reçu: ${result.data.amount} FCFA de ${result.data.sender_wallet_id}`,
        };
      }

      setNfcScanning(false);
      throw new Error("Aucune transaction trouvée sur le tag");
    } catch (err) {
      setError(String(err));
      setNfcScanning(false);
      console.error("NFC Receive Error:", err);
      return {
        success: false,
        message: String(err),
      };
    }
  }, []);

  // ========== BLUETOOTH FUNCTIONS ==========

  // Scanner les appareils Bluetooth
  const startBluetoothScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    setDevices([]);

    try {
      // Utiliser le scan Rust backend
      const result = await invoke<any>("bluetooth_scan_devices");

      if (result.success && result.data) {
        setDevices(result.data);
        setIsScanning(false);
        return result.data;
      }

      throw new Error(result.error || "Bluetooth scan failed");
    } catch (err) {
      setError(String(err));
      setIsScanning(false);
      console.error("Bluetooth Scan Error:", err);
      return [];
    }
  }, []);

  // Connecter à un appareil Bluetooth
  const connectBluetoothDevice = useCallback(async (device: BluetoothDevice) => {
    setError(null);

    try {
      const result = await invoke<any>("bluetooth_connect", {
        deviceId: device.id,
      });

      if (result.success) {
        setConnectedDevice(device);
        return {
          success: true,
          message: `Connecté à ${device.name}`,
        };
      }

      throw new Error(result.error || "Connection failed");
    } catch (err) {
      setError(String(err));
      console.error("Bluetooth Connect Error:", err);
      return {
        success: false,
        message: String(err),
      };
    }
  }, []);

  // Déconnecter du Bluetooth
  const disconnectDevice = useCallback(async () => {
    setConnectedDevice(null);
    setError(null);
    return {
      success: true,
      message: "Déconnecté",
    };
  }, []);

  // Envoyer via Bluetooth
  const sendTransactionBluetooth = useCallback(
    async (receiverId: string, amount: number) => {
      if (!connectedDevice) {
        setError("Aucun appareil connecté");
        return {
          success: false,
          message: "Connectez d'abord un appareil Bluetooth",
        };
      }

      setError(null);

      try {
        const result = await invoke<any>("bluetooth_send_transaction", {
          deviceId: connectedDevice.id,
          receiverId: receiverId,
          amount,
        });

        if (result.success) {
          return {
            success: true,
            message: `Transaction ${amount} FCFA envoyée à ${connectedDevice.name}`,
          };
        }

        throw new Error(result.error || "Failed to send transaction");
      } catch (err) {
        setError(String(err));
        console.error("Bluetooth Send Error:", err);
        return {
          success: false,
          message: String(err),
        };
      }
    },
    [connectedDevice]
  );

  // Accepter une transaction reçue
  const acceptTransaction = useCallback(async () => {
    if (!receivedTransaction) {
      return {
        success: false,
        message: "Aucune transaction à accepter",
      };
    }

    setError(null);
    try {
      // Mettre à jour le solde via le hook wallet
      return {
        success: true,
        message: "Transaction acceptée",
        transaction: receivedTransaction,
      };
    } catch (err) {
      setError(String(err));
      return {
        success: false,
        message: String(err),
      };
    }
  }, [receivedTransaction]);

  // Rejeter une transaction reçue
  const rejectTransaction = useCallback(async () => {
    setReceivedTransaction(null);
    setError(null);
    return {
      success: true,
      message: "Transaction rejetée",
    };
  }, []);

  return {
    // État
    devices,
    connectedDevice,
    isScanning,
    error,
    receivedTransaction,
    nfcAvailable,
    nfcScanning,

    // Fonctions NFC
    checkNfcAvailability,
    sendTransactionNFC,
    receiveTransactionNFC,

    // Fonctions Bluetooth
    startBluetoothScan,
    connectBluetoothDevice,
    disconnectDevice,
    sendTransactionBluetooth,

    // Fonctions communes
    acceptTransaction,
    rejectTransaction,
  };
};
