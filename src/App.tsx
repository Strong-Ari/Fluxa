import { useState, useEffect } from "react";
import "./index.css";
import Dashboard from "./screens/Dashboard";
import VaultScreen from "./screens/VaultScreen";
import PaymentRadar from "./screens/PaymentRadar";
import TransactionInProgress from "./screens/TransactionInProgress";
import PaymentReceipt from "./screens/PaymentReceipt";
import { Breadcrumb, NavBar } from "./components/Navigation";

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

  // Initialize route from URL hash and listen for changes
  useEffect(() => {
    const updateScreenFromHash = () => {
      const hash = window.location.hash.slice(1); // Remove the #

      // Map hash routes to screen types
      const routeMap: Record<string, ScreenType> = {
        "": "dashboard",
        "/": "dashboard",
        "/dashboard": "dashboard",
        "/vault": "vault",
        "/radar": "radar",
        "/transaction": "transaction",
        "/receipt": "receipt",
      };

      const screen = routeMap[hash] || "dashboard";
      setCurrentScreen(screen);
    };

    updateScreenFromHash();
    window.addEventListener("hashchange", updateScreenFromHash);
    return () => window.removeEventListener("hashchange", updateScreenFromHash);
  }, []);

  const handleNavigate = (screen: ScreenType, data?: TransactionData) => {
    if (data) setTransactionData(data);
    setCurrentScreen(screen);
    // Update URL with proper hash route
    window.location.hash = screen === "dashboard" ? "/" : `/${screen}`;
  };

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-br from-navy-deep via-space-dark to-space-dark overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-royal rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb currentScreen={currentScreen} onNavigate={handleNavigate} />

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

      {/* Bottom Navigation Bar */}
      <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} />
    </div>
  );
}
