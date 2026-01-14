import { useState } from "react";

interface DashboardProps {
  onNavigate: (screen: string, data?: any) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [onlineBalance] = useState(25000);
  const [offlineBalance] = useState(15000);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header with Rust Security Indicator */}
      <div className="absolute top-8 right-8 center gap-2">
        <div className="animate-pulse">
          <div className="w-3 h-3 rounded-full bg-neon-green"></div>
        </div>
        <span className="text-xs font-grotesk text-neon-green uppercase tracking-wider">Mémoire Sécurisée</span>
      </div>

      {/* Title */}
      <div className="text-center mb-12 mt-16">
        <h1 className="text-5xl font-grotesk font-bold text-white mb-2">
          Kpay <span className="text-gold-royal">Offline</span>
        </h1>
        <p className="text-gray-400 text-sm tracking-widest">PAIEMENT DÉCENTRALISÉ</p>
      </div>

      {/* Floating Bank Card */}
      <div className="w-full max-w-md mb-8 perspective">
        <div className="glass-card-alt p-8 animate-float shadow-floating border-glass-border">
          {/* Card Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Solde Disponible</p>
              <p className="text-3xl font-grotesk font-bold text-gold-royal">{onlineBalance.toLocaleString()} FCFA</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-gold-royal to-yellow-600 rounded-lg center">
              <span className="text-lg font-bold text-space-dark">₵</span>
            </div>
          </div>

          {/* Card Brand */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Mode</p>
              <p className="text-sm font-grotesk text-white">
                {isCloudMode ? "Cloud Sync" : "Local Secure"}
              </p>
            </div>
            <p className="text-xs text-gray-500">KPAY OFFLINE</p>
          </div>
        </div>
      </div>

      {/* Cloud/Local Toggle */}
      <div className="flex items-center gap-4 mb-12">
        <span className={`text-sm font-grotesk uppercase tracking-wider ${isCloudMode ? "text-gold-royal" : "text-gray-400"}`}>
          ☁️ Cloud
        </span>
        <button
          onClick={() => setIsCloudMode(!isCloudMode)}
          className={`toggle-switch ${isCloudMode ? "active" : ""}`}
        ></button>
        <span className={`text-sm font-grotesk uppercase tracking-wider ${!isCloudMode ? "text-neon-green" : "text-gray-400"}`}>
          🔒 Local
        </span>
      </div>

      {/* Dual Balance Display */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-12">
        {/* Online Balance */}
        <div className="glass-card p-6 center flex-col">
          <div className="text-2xl mb-2">☁️</div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Online</p>
          <p className="text-2xl font-grotesk font-bold text-gold-royal text-center">
            {onlineBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">FCFA</p>
        </div>

        {/* Offline Balance - The Vault */}
        <div className="glass-card p-6 center flex-col relative">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-royal to-yellow-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative w-12 h-12 rounded-full center bg-gradient-to-br from-gold-royal to-yellow-600 shadow-glow">
              <span className="text-xl">🔐</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 mt-3">Le Coffre</p>
          <p className="text-2xl font-grotesk font-bold text-neon-green text-center">
            {offlineBalance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">FCFA</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => onNavigate("vault")}
          className="w-full btn-primary"
        >
          📤 Sécuriser des Fonds
        </button>

        <button
          onClick={() => onNavigate("radar")}
          className="w-full btn-secondary"
        >
          🎯 Trouver un Marchand
        </button>
      </div>

      {/* Security Info */}
      <div className="mt-16 max-w-md text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="text-neon-green font-grotesk font-bold">Rust Security Engine</span>: Vos transactions sont protégées par Ed25519 et BLE. Sans internet, votre coffre local est votre seule ressource.
        </p>
      </div>
    </div>
  );
}
