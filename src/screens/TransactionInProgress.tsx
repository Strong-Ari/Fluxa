import { useState, useEffect } from "react";

interface TransactionData {
  amount: number;
  merchantName?: string;
  merchantImage?: string;
}

interface TransactionInProgressProps {
  data: TransactionData;
  onNavigate: (screen: string, data?: any) => void;
}

type Step = "crypto" | "signature" | "ble";

export default function TransactionInProgress({
  data,
  onNavigate,
}: TransactionInProgressProps) {
  const [currentStep, setCurrentStep] = useState<Step>("crypto");
  const [progress, setProgress] = useState(0);
  const [allStepsComplete, setAllStepsComplete] = useState(false);

  useEffect(() => {
    const steps: Step[] = ["crypto", "signature", "ble"];
    let currentStepIndex = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 30;

      if (currentProgress >= 100) {
        currentProgress = 100;
        if (currentStepIndex < steps.length - 1) {
          currentStepIndex++;
          setCurrentStep(steps[currentStepIndex]);
          currentProgress = 0;
        } else {
          clearInterval(progressInterval);
          setAllStepsComplete(true);
          setTimeout(() => {
            onNavigate("receipt", {
              ...data,
              transactionId: `TX-${Date.now()}`,
            });
          }, 2000);
          return;
        }
      }

      setProgress(currentProgress);
    }, 300);

    return () => clearInterval(progressInterval);
  }, [data, onNavigate]);

  const getStepMessage = (step: Step) => {
    switch (step) {
      case "crypto":
        return "[1/3] Création du ticket cryptographique...";
      case "signature":
        return "[2/3] Signature Ed25519 appliquée...";
      case "ble":
        return "[3/3] Transfert via BLE (Bluetooth Low Energy)...";
    }
  };

  const getStepIcon = (step: Step) => {
    switch (step) {
      case "crypto":
        return "🔐";
      case "signature":
        return "✍️";
      case "ble":
        return "📡";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Title */}
      <div className="text-center mb-16 mt-8">
        <h1 className="text-4xl font-grotesk font-bold text-white mb-2">
          Transaction en cours
        </h1>
        <p className="text-gray-400 text-sm">Signature et transfert sécurisé</p>
      </div>

      {/* Connection Visualization - Two Circles Connected */}
      <div className="w-full max-w-md mb-16">
        <div className="relative h-48 flex items-center justify-between px-8">
          {/* Buyer Circle */}
          <div className="center flex-col relative">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-royal to-yellow-600 blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full center bg-gradient-to-br from-gold-royal to-yellow-600 shadow-glow">
                <span className="text-3xl">👤</span>
              </div>
            </div>
            <p className="text-xs font-grotesk font-bold text-gold-royal mt-4">Acheteur</p>
            <p className="text-xs text-gray-400 mt-1">(Vous)</p>
          </div>

          {/* Connecting Beam - animated */}
          <div className="flex-1 h-1 mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-royal to-neon-green"></div>
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-green to-transparent"
              style={{
                animation: "slideRight 1.5s ease-in-out infinite",
              }}
            ></div>
          </div>

          {/* Merchant Circle */}
          <div className="center flex-col relative">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-green to-lime-400 blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full center bg-gradient-to-br from-neon-green to-lime-400 shadow-neon">
                <span className="text-3xl">{data.merchantImage || "👨‍💼"}</span>
              </div>
            </div>
            <p className="text-xs font-grotesk font-bold text-neon-green mt-4">Marchand</p>
            <p className="text-xs text-gray-400 mt-1 text-center max-w-16">
              {data.merchantName || "Commerçant"}
            </p>
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="text-center mb-16">
        <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Montant</p>
        <p className="text-5xl font-grotesk font-bold text-gold-royal">
          {data.amount.toLocaleString()}
        </p>
        <p className="text-gray-400 text-sm mt-2">FCFA</p>
      </div>

      {/* Step-by-Step Progress */}
      <div className="glass-card-alt p-8 w-full max-w-md mb-12">
        {/* Current Step Display */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-4">{getStepIcon(currentStep)}</div>
          <p className="font-mono text-sm text-neon-green font-bold tracking-wider">
            {getStepMessage(currentStep)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-glass-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-royal to-neon-green transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="space-y-2">
          {(["crypto", "signature", "ble"] as Step[]).map((step, idx) => {
            const isActive = currentStep === step;
            const isComplete = ["crypto", "signature", "ble"].indexOf(currentStep) > idx;

            return (
              <div key={step} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isComplete
                      ? "bg-neon-green text-space-dark"
                      : isActive
                      ? "bg-gold-royal text-space-dark animate-pulse"
                      : "bg-glass-light text-gray-400"
                  }`}
                >
                  {isComplete ? "✓" : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-grotesk font-bold ${
                    isActive || isComplete ? "text-white" : "text-gray-400"
                  }`}>
                    {step === "crypto" && "Création du ticket cryptographique"}
                    {step === "signature" && "Signature Ed25519"}
                    {step === "ble" && "Transfert via BLE"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step === "crypto" && "Génération de la preuve de transaction"}
                    {step === "signature" && "Signature avec clé privée locale"}
                    {step === "ble" && "Envoi via Bluetooth Low Energy"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Status */}
        {allStepsComplete && (
          <div className="mt-8 pt-6 border-t border-glass-border text-center">
            <p className="text-neon-green font-grotesk font-bold text-sm animate-fade-in">
              ✅ Paiement sécurisé complété!
            </p>
            <p className="text-xs text-gray-400 mt-2">Redirection vers le reçu...</p>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="glass-card p-4 w-full max-w-md text-center">
        <p className="text-xs text-gray-300">
          <span className="font-grotesk font-bold">Powered by Rust</span> - Votre transaction est protégée par cryptographie Ed25519
        </p>
      </div>

      {/* CSS for beam animation */}
      <style>{`
        @keyframes slideRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
