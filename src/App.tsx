import { useState, useEffect } from "react";
import "./index.css";
import Dashboard from "./screens/Dashboard";
import VaultScreen from "./screens/VaultScreen";
import PaymentRadar from "./screens/PaymentRadar";
import TransactionInProgress from "./screens/TransactionInProgress";
import PaymentReceipt from "./screens/PaymentReceipt";
import P2PPaymentScreen from "./screens/P2PPaymentScreen";
import { Breadcrumb, NavBar } from "./components/Navigation";
import { NetworkStatusBanner } from "./components/NetworkStatusBanner";
import { DebugNetworkStatus } from "./components/DebugNetworkStatus";
import { WalletInitializer } from "./components/WalletInitializer";
import { OnlineStatusProvider } from "./contexts/OnlineStatusContext";
import { useSwipeBack } from "./hooks/useSwipeBack";
import { SwipeBackOverlay } from "./components/SwipeBackOverlay";

type ScreenType = "dashboard" | "vault" | "radar" | "transaction" | "receipt" | "p2p";

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

  const { swipeProgress } = useSwipeBack({
    threshold: 80,
    velocityThreshold: 0.3,
    onSwipeBack: () => {
      if (currentScreen !== "dashboard") {
        handleNavigate("dashboard");
      }
    },
  });

  useEffect(() => {
    const updateScreenFromHash = () => {
      const hash = window.location.hash.slice(1);

      const routeMap: Record<string, ScreenType> = {
        "": "dashboard",
        "/": "dashboard",
        "/dashboard": "dashboard",
        "/vault": "vault",
        "/radar": "radar",
        "/transaction": "transaction",
        "/receipt": "receipt",
        "/p2p": "p2p",
      };

      const screen = routeMap[hash] || "dashboard";
      setCurrentScreen(screen);
    };

    updateScreenFromHash();
    window.addEventListener("hashchange", updateScreenFromHash);
    return () => window.removeEventListener("hashchange", updateScreenFromHash);
  }, []);

  const handleNavigate = (screen: string, data?: TransactionData) => {
    if (data) setTransactionData(data);
    setCurrentScreen(screen as ScreenType);
    window.location.hash = screen === "dashboard" ? "/" : `/${screen}`;
  };

  return (
    <WalletInitializer>
      <OnlineStatusProvider>
        <NetworkStatusBanner />
        <DebugNetworkStatus />
        <SwipeBackOverlay progress={swipeProgress} />
        <div className="min-h-screen pb-32 bg-gradient-to-br from-navy-deep via-space-dark to-space-dark overflow-x-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gold-royal rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: "2s" }}></div>
          </div>

          <Breadcrumb currentScreen={currentScreen} onNavigate={handleNavigate} />

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
            {currentScreen === "p2p" && (
              <P2PPaymentScreen onNavigate={handleNavigate} />
            )}
          </div>

          <NavBar currentScreen={currentScreen} onNavigate={handleNavigate} />
        </div>
      </OnlineStatusProvider>
    </WalletInitializer>
  );
}
