import { useState } from "react";
import { useRustWallet } from "../hooks/useRustWallet";
import { useBluetoothNFC, type BluetoothDevice } from "../hooks/useBluetoothNFC";

interface P2PPaymentScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

type TransportMode = "bluetooth" | "nfc";

export default function P2PPaymentScreen({ onNavigate }: P2PPaymentScreenProps) {
  const { wallet, createOfflineTransaction, confirmTransaction } = useRustWallet();
  const {
    nfcAvailable,
    devices,
    connectedDevice,
    isScanning,
    error,
    receivedTransaction,
    checkNfcAvailability,
    sendTransactionNFC,
    receiveTransactionNFC,
    startBluetoothScan,
    connectBluetoothDevice,
    disconnectDevice,
    sendTransactionBluetooth,
    acceptTransaction,
    rejectTransaction,
  } = useBluetoothNFC();

  const [screen, setScreen] = useState<"mode" | "transport" | "scan" | "connect" | "send" | "receive">("mode");
  const [transportMode, setTransportMode] = useState<TransportMode>("bluetooth");
  const [sendAmount, setSendAmount] = useState(1000);
  const [merchantName, setMerchantName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  // Initialiser NFC check au démarrage
  useState(() => {
    checkNfcAvailability();
  });

  // Mode: Choisir transport (NFC vs Bluetooth)
  const handleChooseTransport = async (mode: TransportMode) => {
    setTransportMode(mode);

    if (mode === "nfc") {
      setScreen("send");
      setMessage("Préparation NFC...");
    } else {
      setScreen("scan");
      await startBluetoothScan();
    }
  };

  // Mode: Envoyer de l'argent
  const handleSendMode = async () => {
    setScreen("transport");
  };

  // Sélectionner un appareil et se connecter
  const handleSelectDevice = async (device: BluetoothDevice) => {
    setIsProcessing(true);
    setMessage("Connexion à l'appareil...");

    try {
      await connectBluetoothDevice(device);
      setMessage("✓ Connecté!");
      await new Promise((resolve) => setTimeout(resolve, 800));
      setScreen("send");
    } catch (err) {
      setMessage("✗ Erreur de connexion");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setScreen("scan");
    } finally {
      setIsProcessing(false);
    }
  };

  // Envoyer une transaction P2P
  const handleSendTransaction = async () => {
    if (!sendAmount || sendAmount < 100) {
      setMessage("Montant minimum: 100 FCFA");
      return;
    }

    if (!merchantName) {
      setMessage("Nom du destinataire requis");
      return;
    }

    setIsProcessing(true);
    setMessage("[1/4] Création de la transaction...");

    try {
      // Créer la transaction offline dans le backend Rust
      const tx = await createOfflineTransaction(
        connectedDevice?.id || "nfc_peer",
        merchantName,
        sendAmount
      );

      if (!tx) {
        throw new Error("Erreur lors de la création de la transaction");
      }

      setMessage("[2/4] Signature cryptographique...");
      await new Promise((resolve) => setTimeout(resolve, 800));

      setMessage("[3/4] Transmission " + (transportMode === "nfc" ? "NFC" : "Bluetooth") + "...");
      let sendResult: any = { success: false, message: "Unknown" };

      if (transportMode === "nfc") {
        sendResult = await sendTransactionNFC(connectedDevice?.id || "nfc_peer", sendAmount);
      } else {
        sendResult = await sendTransactionBluetooth(connectedDevice?.id || "bt_peer", sendAmount);
      }

      if (!sendResult.success) {
        throw new Error(sendResult.message || "Erreur lors de la transmission");
      }

      setMessage("[4/4] Confirmation de la transaction...");
      await confirmTransaction(tx.id);

      setMessage("✓ Paiement envoyé avec succès!");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Réinitialiser et retourner
      setSendAmount(1000);
      setMerchantName("");
      await disconnectDevice();
      onNavigate("dashboard");
    } catch (err: any) {
      console.error("Erreur d'envoi:", err);
      setMessage("✗ Erreur: " + (err.message || "Réessayez"));
      setIsProcessing(false);
    }
  };

  // Accepter une transaction reçue
  const handleAcceptTransaction = async () => {
    if (!receivedTransaction) return;

    setIsProcessing(true);
    setMessage("Acceptation en cours...");

    try {
      const result = await acceptTransaction();
      if (result.success) {
        setMessage("✓ Paiement reçu!");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setScreen("mode");
      } else {
        setMessage("✗ Erreur: " + result.message);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setMessage("✗ Erreur: " + err.message);
      setIsProcessing(false);
    }
  };

  // Rejeter une transaction reçue
  const handleRejectTransaction = async () => {
    setIsProcessing(true);
    setMessage("Rejet en cours...");

    try {
      const result = await rejectTransaction();
      if (result.success) {
        setMessage("✓ Paiement rejeté");
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setScreen("mode");
      } else {
        setMessage("✗ Erreur: " + result.message);
        setIsProcessing(false);
      }
    } catch (err: any) {
      setMessage("✗ Erreur: " + err.message);
      setIsProcessing(false);
    }
  };

  // ============ RENDU ============

  if (screen === "mode") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <button
          onClick={() => onNavigate("dashboard")}
          className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors"
        >
          ← Retour
        </button>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-grotesk font-bold text-white mb-4">💳 Paiement P2P</h1>
          <p className="text-gray-400">Échange d'argent sans internet</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <button
            onClick={handleSendMode}
            className="w-full glass-card-alt p-8 text-center hover:border-gold-royal hover:bg-opacity-20 transition-all"
          >
            <div className="text-6xl mb-4">📤</div>
            <h2 className="text-xl font-grotesk font-bold text-gold-royal mb-2">Envoyer de l'Argent</h2>
            <p className="text-gray-400 text-sm">Chercher et payer un proche</p>
          </button>

          <button
            onClick={() => setScreen("receive")}
            className="w-full glass-card-alt p-8 text-center hover:border-neon-green hover:bg-opacity-20 transition-all"
          >
            <div className="text-6xl mb-4">📥</div>
            <h2 className="text-xl font-grotesk font-bold text-neon-green mb-2">Recevoir de l'Argent</h2>
            <p className="text-gray-400 text-sm">Attendre un paiement</p>
          </button>
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-gray-500 text-sm mb-2">Solde Offline Disponible</p>
          <p className="text-3xl font-grotesk font-bold text-neon-green">
            {(wallet?.offline_balance ?? 0).toLocaleString()} FCFA
          </p>
        </div>
      </div>
    );
  }

  if (screen === "transport") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <button
          onClick={() => setScreen("mode")}
          className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors"
        >
          ← Retour
        </button>

        <div className="text-center mb-16">
          <h1 className="text-3xl font-grotesk font-bold text-white mb-4">🚀 Choisir le Mode</h1>
          <p className="text-gray-400 text-sm">Bluetooth ou NFC</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => handleChooseTransport("bluetooth")}
            className="w-full glass-card-alt p-8 text-center hover:border-gold-royal transition-all"
          >
            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-xl font-grotesk font-bold text-gold-royal mb-2">Bluetooth</h2>
            <p className="text-gray-400 text-sm">Portée: ~100m • Fiable</p>
          </button>

          <button
            onClick={() => nfcAvailable ? handleChooseTransport("nfc") : setMessage("NFC non disponible")}
            disabled={!nfcAvailable}
            className={`w-full glass-card-alt p-8 text-center transition-all ${
              nfcAvailable
                ? "hover:border-neon-green"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="text-6xl mb-4">📵</div>
            <h2 className="text-xl font-grotesk font-bold text-neon-green mb-2">NFC</h2>
            <p className="text-gray-400 text-sm">
              {nfcAvailable ? "Portée: ~10cm • Rapide" : "Non disponible"}
            </p>
          </button>
        </div>

        {message && (
          <div className="absolute bottom-8 w-full max-w-md px-6">
            <div className="p-3 rounded-lg text-sm text-center font-grotesk bg-neon-orange bg-opacity-20 text-neon-orange">
              {message}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen === "scan") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <button
          onClick={() => {
            setScreen("transport");
          }}
          className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors"
        >
          ← Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-grotesk font-bold text-white mb-4">📡 Appareils Disponibles</h1>
          <p className="text-gray-400 text-sm">
            {isScanning ? "Recherche en cours..." : "Sélectionnez un appareil"}
          </p>
        </div>

        <div className="w-full max-w-md space-y-3 mb-8">
          {isScanning ? (
            <div className="glass-card-alt p-8 text-center">
              <div className="inline-block">
                <div className="animate-spin text-4xl">🔄</div>
              </div>
              <p className="text-gray-400 mt-4">Recherche des appareils...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="glass-card-alt p-8 text-center">
              <p className="text-gray-400">Aucun appareil trouvé</p>
              <button
                onClick={() => startBluetoothScan()}
                className="mt-4 px-6 py-2 bg-gold-royal text-space-dark rounded-lg font-bold hover:bg-opacity-80 transition-all"
              >
                Relancer la recherche
              </button>
            </div>
          ) : (
            devices.map((device) => (
              <button
                key={device.id}
                onClick={() => handleSelectDevice(device)}
                disabled={isProcessing}
                className="w-full glass-card-alt p-4 text-left hover:border-gold-royal transition-all disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-grotesk font-bold text-white">{device.name}</p>
                    <p className="text-gray-500 text-xs mt-1">Signal: {device.rssi} dBm</p>
                  </div>
                  <div className="text-2xl">○</div>
                </div>
              </button>
            ))
          )}
        </div>

        {error && (
          <div className="w-full max-w-md glass-card-alt p-4 border-neon-orange text-neon-orange text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>
    );
  }

  if (screen === "send") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <button
          onClick={async () => {
            await disconnectDevice();
            setScreen(transportMode === "nfc" ? "transport" : "scan");
          }}
          className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors"
        >
          ← Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-grotesk font-bold text-white mb-2">
            💰 Envoyer {transportMode === "nfc" ? "📵 NFC" : "📡 Bluetooth"}
          </h1>
          {connectedDevice && (
            <p className="text-gray-400 text-sm">
              Connecté à: <span className="text-neon-green">{connectedDevice.name}</span>
            </p>
          )}
        </div>

        <div className="w-full max-w-md space-y-6">
          <div>
            <label className="text-gray-400 text-sm font-grotesk mb-2 block">Montant (FCFA)</label>
            <input
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full glass-card-alt p-4 text-white text-center text-2xl font-bold focus:outline-none focus:border-gold-royal disabled:opacity-50"
              min="100"
              max={wallet?.offline_balance ?? 0}
            />
            <p className="text-gray-500 text-xs mt-2">
              Disponible: {(wallet?.offline_balance ?? 0).toLocaleString()} FCFA
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-sm font-grotesk mb-2 block">Nom du Destinataire</label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Ex: Amenan, Kofi..."
              disabled={isProcessing}
              className="w-full glass-card-alt p-4 text-white focus:outline-none focus:border-gold-royal disabled:opacity-50"
            />
          </div>

          {sendAmount && merchantName && (
            <div className="glass-card-alt p-4 border-neon-green">
              <p className="text-gray-400 text-xs mb-2">RÉSUMÉ</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">À: {merchantName}</span>
                  <span className="text-white font-bold">{sendAmount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center font-grotesk ${
              message.includes("✓") ? "bg-neon-green bg-opacity-20 text-neon-green" :
              message.includes("✗") ? "bg-neon-orange bg-opacity-20 text-neon-orange" :
              "bg-gold-royal bg-opacity-20 text-gold-royal"
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleSendTransaction}
            disabled={isProcessing || !sendAmount || !merchantName}
            className="w-full py-4 bg-gradient-to-r from-gold-royal to-neon-green text-space-dark font-grotesk font-bold rounded-lg hover:shadow-lg hover:shadow-gold-royal disabled:opacity-50 transition-all"
          >
            {isProcessing ? "Traitement..." : "📤 Envoyer"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "receive") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <button
          onClick={() => setScreen("mode")}
          className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors"
        >
          ← Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-grotesk font-bold text-white mb-4">📥 En Attente de Paiement</h1>
          <p className="text-gray-400 text-sm">Maintenez l'appareil proche d'un autre</p>
        </div>

        <div className="w-full max-w-md">
          {receivedTransaction ? (
            <div className="glass-card-alt p-8 space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">💰</div>
                <p className="text-gray-400 text-sm mb-2">Paiement reçu</p>
                <p className="text-4xl font-grotesk font-bold text-neon-green">
                  {receivedTransaction.amount.toLocaleString()}
                </p>
                <p className="text-gray-400 mt-1">FCFA</p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-xs mb-3">DÉTAILS</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">De:</span>
                    <span className="text-white font-mono text-xs">{receivedTransaction.sender_wallet_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Heure:</span>
                    <span className="text-white">{new Date(receivedTransaction.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRejectTransaction}
                  disabled={isProcessing}
                  className="py-3 glass-card-alt hover:border-neon-orange disabled:opacity-50 transition-all rounded-lg font-bold"
                >
                  ✗ Rejeter
                </button>
                <button
                  onClick={handleAcceptTransaction}
                  disabled={isProcessing}
                  className="py-3 bg-neon-green text-space-dark rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  ✓ Accepter
                </button>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm text-center font-grotesk ${
                  message.includes("✓") ? "bg-neon-green bg-opacity-20 text-neon-green" :
                  "bg-neon-orange bg-opacity-20 text-neon-orange"
                }`}>
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card-alt p-12 text-center space-y-6">
              <div className="inline-block">
                <div className="text-8xl animate-pulse">📡</div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">À l'écoute...</p>
                <p className="text-xs text-gray-600">Rapprochez deux appareils l'un de l'autre</p>
              </div>

              <button
                onClick={() => receiveTransactionNFC()}
                className="text-gold-royal text-xs hover:underline"
              >
                [Simuler réception NFC]
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 text-center">
          <p className="text-gray-500 text-sm mb-2">Solde Offline Actuel</p>
          <p className="text-3xl font-grotesk font-bold text-neon-green">
            {(wallet?.offline_balance ?? 0).toLocaleString()} FCFA
          </p>
        </div>
      </div>
    );
  }

  return null;
}
