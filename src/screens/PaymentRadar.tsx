import { useState, useEffect } from "react";

interface PaymentRadarProps {
  onNavigate: (screen: string, data?: any) => void;
}

interface Merchant {
  id: string;
  name: string;
  image: string;
  distance: number; // 0-1 (closer to center = closer = larger)
  angle: number; // 0-360
}

const MERCHANTS = [
  {
    id: "1",
    name: "Chez Amenan",
    image: "👨‍🍳",
  },
  {
    id: "2",
    name: "Moto-Taxi",
    image: "🏍️",
  },
  {
    id: "3",
    name: "Fruits Frais",
    image: "🍌",
  },
  {
    id: "4",
    name: "Tech Store",
    image: "💻",
  },
];

export default function PaymentRadar({ onNavigate }: PaymentRadarProps) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [scanning, setScanning] = useState(true);
  const radarRadius = 200; // pixels

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      const newMerchants = MERCHANTS.map((merchant) => ({
        ...merchant,
        distance: Math.random() * 0.8 + 0.1,
        angle: Math.random() * 360,
      }));
      setMerchants(newMerchants);
    }, 2000);

    return () => clearInterval(interval);
  }, [scanning]);

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setScanning(false);
    setTimeout(() => {
      onNavigate("transaction", {
        amount: 5000,
        merchantName: merchant.name,
        merchantImage: merchant.image,
      });
    }, 1500);
  };

  const getMerchantPosition = (merchant: Merchant) => {
    const distance = merchant.distance * radarRadius;
    const angle = (merchant.angle * Math.PI) / 180;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const scale = 0.5 + merchant.distance;
    return { x, y, scale };
  };

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
      <div className="text-center mb-8 mt-8">
        <h1 className="text-4xl font-grotesk font-bold text-white mb-2">Radar de Paiement</h1>
        <p className="text-gray-400 text-sm">Trouvez un marchand à proximité</p>
      </div>

      {/* Radar Container */}
      <div className="relative w-full max-w-md mb-12">
        <div className="glass-card-alt p-8 aspect-square flex items-center justify-center relative overflow-hidden">
          {/* Radar Background */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`${-radarRadius - 50} ${-radarRadius - 50} ${(radarRadius + 50) * 2} ${(radarRadius + 50) * 2}`}
          >
            {/* Concentric circles */}
            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <circle
                key={`circle-${scale}`}
                cx="0"
                cy="0"
                r={radarRadius * scale}
                fill="none"
                stroke="rgba(255, 215, 0, 0.2)"
                strokeWidth="1"
              />
            ))}

            {/* Radar lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * radarRadius;
              const y = Math.sin(rad) * radarRadius;
              return (
                <line
                  key={`line-${angle}`}
                  x1="0"
                  y1="0"
                  x2={x}
                  y2={y}
                  stroke="rgba(57, 255, 20, 0.15)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Animated sweep */}
            {scanning && (
              <g>
                <circle
                  cx="0"
                  cy="0"
                  r={radarRadius}
                  fill="none"
                  stroke="rgba(57, 255, 20, 0.3)"
                  strokeWidth="2"
                  className="animate-radar"
                  style={{
                    filter: "drop-shadow(0 0 10px rgba(57, 255, 20, 0.5))",
                  }}
                />
              </g>
            )}
          </svg>

          {/* Center point */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gold-royal shadow-glow flex items-center justify-center z-10">
              <div className="w-2 h-2 rounded-full bg-space-dark"></div>
            </div>
          </div>

          {/* Merchants bubbles */}
          {merchants.map((merchant) => {
            const { x, y, scale } = getMerchantPosition(merchant);
            const isSelected = selectedMerchant?.id === merchant.id;

            return (
              <div
                key={merchant.id}
                className="absolute transition-all duration-300 cursor-pointer"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
                  left: "50%",
                  top: "50%",
                  zIndex: isSelected ? 20 : 10,
                }}
                onClick={() => handleMerchantSelect(merchant)}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                    isSelected
                      ? "bg-neon-green shadow-neon scale-150"
                      : "glass-card border-gold-royal hover:shadow-glow"
                  }`}
                >
                  {merchant.image}
                </div>
                {isSelected && (
                  <p className="text-xs text-neon-green font-grotesk font-bold mt-2 text-center whitespace-nowrap">
                    {merchant.name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Merchants List */}
      <div className="w-full max-w-md mb-12">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Marchands Détectés</p>
        <div className="grid grid-cols-2 gap-3">
          {merchants.map((merchant) => (
            <button
              key={merchant.id}
              onClick={() => handleMerchantSelect(merchant)}
              className={`glass-card p-4 text-center transition-all ${
                selectedMerchant?.id === merchant.id
                  ? "border-neon-green bg-neon-green bg-opacity-10"
                  : "hover:border-gold-royal"
              }`}
            >
              <div className="text-3xl mb-2">{merchant.image}</div>
              <p className="text-xs font-grotesk font-bold">{merchant.name}</p>
              <p className="text-xs text-gray-500 mt-1">~{Math.floor(merchant.distance * 100)}m</p>
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="glass-card p-4 w-full max-w-md text-center">
        <p className="text-sm text-gray-300">
          {scanning ? (
            <>
              <span className="inline-block animate-pulse">🔍</span> Scan Bluetooth en cours...
            </>
          ) : selectedMerchant ? (
            <>
              ✅ {selectedMerchant.name} sélectionné - Initialisation paiement...
            </>
          ) : (
            "Aucun marchand sélectionné"
          )}
        </p>
      </div>
    </div>
  );
}
