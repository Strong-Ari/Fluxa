import { useState, useEffect } from "react";
import "./index.css";
import Dashboard from "./screens/Dashboard";
import VaultScreen from "./screens/VaultScreen";
import PaymentRadar from "./screens/PaymentRadar";
import TransactionInProgress from "./screens/TransactionInProgress";
import PaymentReceipt from "./screens/PaymentReceipt";

type ScreenType = "dashboard" | "vault" | "radar" | "transaction" | "receipt";

interface TransactionData {
  amount: number;
  merchantName?: string;
  merchantImage?: string;
  transactionId?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("dashboard");
  const [transactionData, setTransactionData] = useState<TransactionData>({
    amount: 0,
  });

  // Initialize route from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the #
    const screen = hash as ScreenType;
    if (["dashboard", "vault", "radar", "transaction", "receipt"].includes(screen)) {
      setCurrentScreen(screen);
    }
  }, []);

  const handleNavigate = (screen: ScreenType, data?: TransactionData) => {
    if (data) setTransactionData(data);
    setCurrentScreen(screen);
    // Update URL
    window.location.hash = screen;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-deep via-space-dark to-space-dark">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-royal rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Screen Container */}
      <div className="relative z-10">
        {currentScreen === "dashboard" && (
          <Dashboard onNavigate={handleNavigate} />
        )}
        {currentScreen === "vault" && (
          <VaultScreen onNavigate={handleNavigate} />
        )}
        {currentScreen === "radar" && (
          <PaymentRadar onNavigate={handleNavigate} />
        )}
        {currentScreen === "transaction" && (
          <TransactionInProgress
            data={transactionData}
            onNavigate={handleNavigate}
          />
        )}
        {currentScreen === "receipt" && (
          <PaymentReceipt data={transactionData} onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
