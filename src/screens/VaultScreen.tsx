import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface VaultScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export default function VaultScreen({ onNavigate }: VaultScreenProps) {
  const [selectedAmount, setSelectedAmount] = useState(5000);
  const [isSecuring, setIsSecuring] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const maxAmount = 25000;

  const handleSecure = async () => {
    setIsSecuring(true);
    setSecurityMessage("Initialisation du coffre...");

    try {
      // Simulate calling Rust backend
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSecurityMessage("[1/3] Création de la clé Ed25519...");

      await new Promise((resolve) => setTimeout(resolve, 800));
      setSecurityMessage("[2/3] Chiffrement du portefeuille local...");

      await new Promise((resolve) => setTimeout(resolve, 800));
      setSecurityMessage("[3/3] Synchronisation complète!");

      // Trigger haptic feedback if available
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Wait before transitioning
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSecuring(false);
      onNavigate("dashboard");
    } catch (error) {
      console.error("Erreur de sécurisation:", error);
      setSecurityMessage("Erreur: Veuillez réessayer");
      setIsSecuring(false);
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
        <h1 className="text-4xl font-grotesk font-bold text-white mb-2">Le Coffre</h1>
        <p className="text-gray-400 text-sm">Sécurisez vos fonds hors ligne</p>
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
              <div className="text-5xl">{isSecuring ? "🔓" : "🔐"}</div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-royal to-neon-green opacity-0 animate-pulse" style={{
              boxShadow: "inset 0 0 20px rgba(255, 215, 0, 0.3)"
            }}></div>
          </div>

          {/* Status Text */}
          <p className="text-center text-sm text-gray-400 mb-8 font-grotesk tracking-wider">
            {isSecuring ? "Sécurisation en cours..." : "Montant à sécuriser"}
          </p>

          {/* Amount Display */}
          <div className="text-center mb-8">
            <p className="text-5xl font-grotesk font-bold text-gold-royal mb-1">
              {selectedAmount.toLocaleString()}
            </p>
            <p className="text-gray-400 text-sm uppercase tracking-widest">FCFA</p>
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
          {isSecuring && (
            <div className="w-full mb-6 space-y-2">
              <p className="font-mono text-xs text-neon-green animate-fade-in text-center">
                {securityMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slider Control */}
      {!isSecuring && (
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
      {!isSecuring && (
        <div className="grid grid-cols-4 gap-2 w-full max-w-md mb-12">
          {[2000, 5000, 10000, 15000].map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(Math.min(amount, maxAmount))}
              className={`py-3 px-2 rounded-lg font-grotesk font-bold text-xs uppercase tracking-wider transition-all ${
                selectedAmount === amount
                  ? "bg-gold-royal text-space-dark"
                  : "glass-card hover:border-gold-royal"
              }`}
            >
              {(amount / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      )}

      {/* Security Button */}
      {!isSecuring && (
        <button
          onClick={handleSecure}
          disabled={isSecuring}
          className="w-full max-w-md btn-neon mb-8"
        >
          🔒 Sécuriser par Rust
        </button>
      )}

      {/* Info Card */}
      <div className="glass-card p-6 w-full max-w-md">
        <p className="text-xs text-gray-300 leading-relaxed space-y-2">
          <span className="block font-grotesk font-bold text-neon-green mb-2">ℹ️ Sans Internet</span>
          Seuls les fonds dans le coffre sont accessibles hors ligne. Vos transactions locales seront synchronisées avec le serveur dès la reconnexion.
        </p>
      </div>
    </div>
  );
}
