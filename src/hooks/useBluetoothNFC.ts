import { useState, useCallback, useEffect } from "react";

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number; // Signal strength
  connected: boolean;
}

export interface P2PTransaction {
  id: string;
  senderWalletId: string;
  receiverWalletId: string;
  amount: number;
  signature: string;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

/**
 * Hook pour gérer la communication Bluetooth/NFC
 * - Découverte d'appareils
 * - Connexion/déconnexion
 * - Envoi/réception de transactions
 */
export const useBluetoothNFC = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedTransaction, setReceivedTransaction] = useState<P2PTransaction | null>(null);

  // Simuler la découverte d'appareils Bluetooth (en production: utiliser react-native-ble-plx)
  const startScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    setDevices([]);

    try {
      // Vérifier si Bluetooth Web API est disponible
      if (!("bluetooth" in navigator)) {
        // Mode Web - simuler des appareils
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const simulatedDevices: BluetoothDevice[] = [
          { id: "device_001", name: "📱 Téléphone d'Amenan", rssi: -45, connected: false },
          { id: "device_002", name: "📱 iPhone de Kofi", rssi: -62, connected: false },
          { id: "device_003", name: "📱 Samsung d'Ama", rssi: -75, connected: false },
        ];
        setDevices(simulatedDevices);
        setIsScanning(false);
        return;
      }

      // Mode natif (Tauri mobile) - utiliser Web Bluetooth API
      const device = await (navigator.bluetooth as any).requestDevice({
        acceptAllDevices: true,
        optionalServices: ["fluxa-payment-service"],
      });

      if (device) {
        setDevices([
          {
            id: device.id,
            name: device.name || "Appareil inconnu",
            rssi: -50,
            connected: false,
          },
        ]);
      }
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        setError(err.message || "Erreur lors de la découverte des appareils");
      }
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Connecter à un appareil
  const connectDevice = useCallback(async (device: BluetoothDevice) => {
    setError(null);

    try {
      // Simuler la connexion (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setConnectedDevice(device);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
      setConnectedDevice(null);
    }
  }, []);

  // Déconnecter de l'appareil
  const disconnectDevice = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setConnectedDevice(null);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la déconnexion");
    }
  }, []);

  // Envoyer une transaction via Bluetooth/NFC
  const sendTransaction = useCallback(
    async (tx: P2PTransaction) => {
      if (!connectedDevice) {
        setError("Aucun appareil connecté");
        return false;
      }

      try {
        // Simuler l'envoi (1s pour représenter la transmission BLE)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // En production: envoyer via caracteristique GATT
        console.log(`📤 Transaction envoyée à ${connectedDevice.name}:`, tx);

        return true;
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'envoi");
        return false;
      }
    },
    [connectedDevice]
  );

  // Recevoir une transaction (simulé)
  const receiveTransaction = useCallback(() => {
    const mockTx: P2PTransaction = {
      id: `tx_${Date.now()}`,
      senderWalletId: "wallet_remote",
      receiverWalletId: "wallet_local",
      amount: 2500,
      signature:
        "sig_mockshaBitwise1234567890abcdefghijklmnopqrstuvwxyz0123456789",
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    setReceivedTransaction(mockTx);
  }, []);

  // Accepter une transaction reçue
  const acceptTransaction = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setReceivedTransaction(null);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'acceptation");
      return false;
    }
  }, []);

  // Rejeter une transaction reçue
  const rejectTransaction = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setReceivedTransaction(null);
      return true;
    } catch (err: any) {
      setError(err.message || "Erreur lors du rejet");
      return false;
    }
  }, []);

  // Simuler la réception périodique (en mode demo)
  useEffect(() => {
    const demoReceiveTimer = setInterval(() => {
      // 20% chance de recevoir une transaction si pas déjà en attente
      if (!receivedTransaction && Math.random() < 0.2) {
        // receiveTransaction(); // Décommentez pour mode demo continu
      }
    }, 5000);

    return () => clearInterval(demoReceiveTimer);
  }, [receivedTransaction]);

  return {
    // État
    devices,
    connectedDevice,
    isScanning,
    error,
    receivedTransaction,

    // Actions
    startScan,
    connectDevice,
    disconnectDevice,
    sendTransaction,
    receiveTransaction,
    acceptTransaction,
    rejectTransaction,
  };
};
