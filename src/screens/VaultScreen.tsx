import { useState } from "react";
import { useRustWallet } from "../hooks/useRustWallet";

interface VaultScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export default function VaultScreen({ onNavigate }: VaultScreenProps) {
  const { wallet, transferToVault, transferFromVault, error } = useRustWallet();
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [mode, setMode] = useState<"secure" | "withdraw">("secure");

  const maxAmount = mode === "secure"
    ? (wallet?.online_balance ?? 25000)
    : (wallet?.offline_balance ?? 15000);

  const handleTransaction = async () => {
    if (selectedAmount <= 0 || selectedAmount > maxAmount) {
      setSecurityMessage("Montant invalide");
      return;
    }

    setIsProcessing(true);
    const isSecuring = mode === "secure";
    setSecurityMessage(isSecuring ? "Initialisation du coffre..." : "Retrait du coffre...");

    try {
      // Simulate progress
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSecurityMessage(`[1/3] Création de la clé Ed25519...`);

      await new Promise((resolve) => setTimeout(resolve, 800));
      setSecurityMessage(`[2/3] ${isSecuring ? "Chiffrement" : "Déchiffrement"} du portefeuille local...`);

      // Call Rust backend
      const success = isSecuring
        ? await transferToVault(selectedAmount)
        : await transferFromVault(selectedAmount);

      if (!success) {
        throw new Error(isSecuring ? "Secure transfer failed" : "Withdraw failed");
      }

      setSecurityMessage(`[3/3] Synchronisation complète!`);

      // Trigger haptic feedback if available
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Wait before transitioning
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsProcessing(false);
      onNavigate("dashboard");
    } catch (err) {
      console.error(`Erreur de transaction:`, err);
      setSecurityMessage(error || "Erreur: Veuillez réessayer");
      setIsProcessing(false);
    }
  };

  const percentage = (selectedAmount / maxAmount) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate("dashboard")}
        className="absolute top-8 left-8 text-gray-400 hover:text-gold-royal transition-colors"
      >
        ← Retour
      </button>

      {/* Title */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl font-grotesk font-bold text-white mb-4">Le Coffre</h1>

        {/* Mode Toggle */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={() => { setMode("secure"); setSelectedAmount(5000); }}
            className={`px-4 py-2 rounded-lg font-grotesk font-bold text-sm uppercase transition-all ${
              mode === "secure"
                ? "bg-gold-royal text-space-dark"
                : "glass-card hover:border-gold-royal"
            }`}
          >
            🔒 Sécuriser
          </button>
          <button
            onClick={() => { setMode("withdraw"); setSelectedAmount(3000); }}
            className={`px-4 py-2 rounded-lg font-grotesk font-bold text-sm uppercase transition-all ${
              mode === "withdraw"
                ? "bg-neon-green text-space-dark"
                : "glass-card hover:border-neon-green"
            }`}
          >
            💰 Retirer
          </button>
        </div>

        <p className="text-gray-400 text-sm">
          {mode === "secure" ? "Transférer du solde en ligne au coffre" : "Retirer du coffre vers le solde en ligne"}
        </p>
      </div>

      {/* Vault Animation Container */}
      <div className="w-full max-w-md mb-12">
        <div className="glass-card-alt p-12 center flex-col relative overflow-hidden">
          {/* Vault Door Animation */}
          <div className="relative w-24 h-24 mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-gold-royal rounded-full animate-pulse"></div>

            {/* Middle ring */}
            <div className="absolute inset-2 border-2 border-neon-green rounded-full" style={{ opacity: 0.5 }}></div>

            {/* Center vault icon */}
            <div className="absolute inset-0 center">
              <div className="text-5xl">{isProcessing ? (mode === "secure" ? "🔓" : "💸") : "🔐"}</div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-royal to-neon-green opacity-0 animate-pulse" style={{
              boxShadow: "inset 0 0 20px rgba(255, 215, 0, 0.3)"
            }}></div>
          </div>

          {/* Status Text */}
          <p className="text-center text-sm text-gray-400 mb-8 font-grotesk tracking-wider">
            {isProcessing ? (mode === "secure" ? "Sécurisation en cours..." : "Retrait en cours...") : "Montant"}
          </p>

          {/* Amount Display */}
          <div className="text-center mb-8">
            <p className="text-5xl font-grotesk font-bold text-gold-royal mb-1">
              {selectedAmount.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm uppercase tracking-widest">FCFA</p>
          </div>

          {/* Balance Info */}
          <div className="text-center mb-8 text-xs text-gray-500">
            <p>Disponible: {maxAmount.toLocaleString()} FCFA</p>
            <p className="text-gray-600 text-xs mt-1">
              {mode === "secure"
                ? `Coffre: ${(wallet?.offline_balance ?? 0).toLocaleString()} FCFA`
                : `En ligne: ${(wallet?.online_balance ?? 0).toLocaleString()} FCFA`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-8">
            <div className="h-2 bg-glass-light rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-royal to-neon-green transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-right mt-2">{percentage.toFixed(0)}% de votre solde</p>
          </div>

          {/* Security Info */}
          {isProcessing && (
            <div className="w-full mb-6 space-y-2">
              <p className="font-mono text-xs text-neon-green animate-fade-in text-center">
                {securityMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slider Control */}
      {!isProcessing && (
        <div className="w-full max-w-md mb-12">
          <label className="block text-xs text-gray-400 uppercase tracking-widest mb-4">
            Ajustez le montant
          </label>
          <input
            type="range"
            min="1000"
            max={maxAmount}
            step="500"
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>1 000 FCFA</span>
            <span>{maxAmount.toLocaleString()} FCFA</span>
          </div>
        </div>
      )}

      {/* Quick Amount Buttons */}
      {!isProcessing && (
        <div className="grid grid-cols-4 gap-2 w-full max-w-md mb-12">
          {(mode === "secure" ? [2000, 5000, 10000, 15000] : [1000, 3000, 5000, 10000]).map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(Math.min(amount, maxAmount))}
              className={`py-3 px-2 rounded-lg font-grotesk font-bold text-xs uppercase tracking-wider transition-all ${
                selectedAmount === amount
                  ? mode === "secure" ? "bg-gold-royal text-space-dark" : "bg-neon-green text-space-dark"
                  : "glass-card hover:border-gold-royal"
              }`}
            >
              {(amount / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      )}

      {/* Transaction Button */}
      {!isProcessing && (
        <button
          onClick={handleTransaction}
          disabled={isProcessing}
          className={`w-full max-w-md mb-8 font-grotesk font-bold uppercase ${
            mode === "secure"
              ? "btn-neon"
              : "bg-neon-green hover:bg-neon-green/90 text-space-dark px-8 py-4 rounded-lg transition-all"
          }`}
        >
          {mode === "secure" ? "🔒 Sécuriser" : "💸 Retirer"}
        </button>
      )}

      {/* Info Card */}
      <div className="glass-card p-6 w-full max-w-md">
        <p className="text-xs text-gray-300 leading-relaxed space-y-2">
          <span className="block font-grotesk font-bold text-neon-green mb-2">ℹ️ {mode === "secure" ? "Sécurisation" : "Retrait"}</span>
          {mode === "secure"
            ? "Transférez vos fonds du solde en ligne au coffre local pour un accès hors ligne sécurisé."
            : "Transférez vos fonds du coffre local au solde en ligne pour les synchroniser avec le serveur."}
        </p>
      </div>
    </div>
  );
}
