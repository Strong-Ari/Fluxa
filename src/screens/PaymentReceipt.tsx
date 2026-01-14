import { useState } from "react";

interface TransactionData {
  amount: number;
  merchantName?: string;
  merchantImage?: string;
  transactionId?: string;
}

interface PaymentReceiptProps {
  data: TransactionData;
  onNavigate: (screen: string, data?: any) => void;
}

export default function PaymentReceipt({ data, onNavigate }: PaymentReceiptProps) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    const receiptText = `
🧾 REÇU DE PAIEMENT KPAY OFFLINE
═══════════════════════════════

Montant: ${data.amount.toLocaleString()} FCFA
Marchand: ${data.merchantName || "Commerçant"}
ID Transaction: ${data.transactionId || "N/A"}

Status: ✅ Paiement vérifié hors-ligne
En attente de synchronisation cloud...

═══════════════════════════════
Powered by Rust Security Engine
    `;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Reçu Kpay Offline",
          text: receiptText,
        });
      } catch (err) {
        console.log("Partage annulé");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(receiptText);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const timestamp = new Date().toLocaleString("fr-CI");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="text-center mb-8 mt-8">
        <h1 className="text-4xl font-grotesk font-bold text-white mb-2">Paiement Réussi</h1>
        <p className="text-gray-400 text-sm">Votre reçu numérique</p>
      </div>

      {/* Receipt Ticket - Sliding from top */}
      <div className="w-full max-w-sm mb-12 animate-slide-down">
        <div className="glass-card-alt p-8 space-y-6 relative">
          {/* Top decoration */}
          <div className="flex justify-between items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gold-royal opacity-20"></div>
            <div className="w-8 h-8 rounded-full bg-neon-green opacity-20"></div>
          </div>

          {/* Receipt Header */}
          <div className="text-center border-b border-glass-border pb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Kpay Offline</p>
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-xs text-gray-500 font-mono">{data.transactionId}</p>
          </div>

          {/* Merchant Info */}
          <div className="text-center">
            <div className="text-4xl mb-2">{data.merchantImage || "👨‍💼"}</div>
            <p className="font-grotesk font-bold text-white">{data.merchantName || "Commerçant"}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono">{timestamp}</p>
          </div>

          {/* Amount - Main Focus */}
          <div className="relative py-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-royal to-neon-green rounded-lg opacity-10 blur-lg"></div>
            <div className="relative text-center">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Montant payé</p>
              <p className="text-6xl font-grotesk font-bold text-neon-green">
                {data.amount.toLocaleString()}
              </p>
              <p className="text-lg text-gold-royal font-grotesk font-bold mt-2">FCFA</p>
            </div>
          </div>

          {/* Security Seal */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Shield background */}
              <div className="absolute inset-0 text-5xl opacity-20">🛡️</div>

              {/* Rust gear icon with glow */}
              <div className="relative z-10 text-4xl animate-pulse" style={{
                filter: "drop-shadow(0 0 10px rgba(57, 255, 20, 0.8))"
              }}>
                ⚙️
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center border-t border-glass-border pt-6 space-y-2">
            <p className="font-grotesk font-bold text-neon-green text-sm">✅ Paiement Vérifié</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              En attente de synchronisation cloud
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Votre transaction est sécurisée par Ed25519
            </p>
          </div>

          {/* Bottom decoration */}
          <div className="flex justify-between items-center mt-4">
            <div className="w-8 h-8 rounded-full bg-neon-green opacity-20"></div>
            <div className="w-8 h-8 rounded-full bg-gold-royal opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <button
          onClick={handleShare}
          className="w-full btn-secondary"
        >
          {isShared ? "✅ Copié!" : "📤 Partager le Reçu"}
        </button>

        <button
          onClick={() => onNavigate("dashboard")}
          className="w-full btn-primary"
        >
          ← Retour à l'Accueil
        </button>
      </div>

      {/* Receipt Details */}
      <div className="glass-card p-6 w-full max-w-sm space-y-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">Détails de la Transaction</p>
          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white">Paiement BLE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mode</span>
              <span className="text-neon-green">Hors-Ligne</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Signature</span>
              <span className="text-gold-royal">Ed25519</span>
            </div>
            <div className="flex justify-between border-t border-glass-border pt-3 mt-3">
              <span className="text-gray-400">Hash TX</span>
              <span className="text-white text-right">
                {data.transactionId?.slice(-12) || "pending..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Besoin d'aide? Contactez le support Kpay</p>
      </div>
    </div>
  );
}
