import { ScreenType, ROUTE_NAMES } from "../router/routes";
import { useOnlineStatusContext } from "../contexts/OnlineStatusContext";

interface NavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate }) => {
  const screens: ScreenType[] = ["dashboard", "vault", "radar"];
  const { isOnline } = useOnlineStatusContext();

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card mx-4 mb-4 rounded-2xl border-t border-glass-border">
      <div className="flex items-center justify-around py-4 relative">
        {screens.map((screen) => (
          <button
            key={screen}
            onClick={() => onNavigate(screen)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              currentScreen === screen
                ? "bg-gold-royal text-space-dark"
                : "text-gray-400 hover:text-gold-royal"
            }`}
            title={ROUTE_NAMES[screen]}
          >
            <span className="text-lg">
              {screen === "dashboard" && "🏠"}
              {screen === "vault" && "🔐"}
              {screen === "radar" && "🎯"}
            </span>
            <span className="text-xs font-grotesk font-bold hidden sm:inline">
              {screen === "dashboard" && "Home"}
              {screen === "vault" && "Vault"}
              {screen === "radar" && "Radar"}
            </span>
          </button>
        ))}
        {/* Online/Offline Indicator */}
        <div
          className={`absolute bottom-4 right-4 flex items-center gap-2 text-xs font-bold ${
            isOnline ? "text-green-400" : "text-red-400"
          }`}
          title={isOnline ? "Connected" : "Offline"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span className="hidden sm:inline">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

interface BreadcrumbProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const { isOnline } = useOnlineStatusContext();

  return (
    <div className="fixed top-8 left-8 flex items-center gap-2 text-sm">
      <button
        onClick={() => onNavigate("dashboard")}
        className="text-gray-400 hover:text-gold-royal transition-colors"
      >
        Fluxa
      </button>
      {currentScreen !== "dashboard" && (
        <>
          <span className="text-gray-500">/</span>
          <span className="text-gold-royal font-grotesk font-bold">
            {ROUTE_NAMES[currentScreen]}
          </span>
        </>
      )}
      {/* Network Status Badge */}
      <div className="ml-auto flex items-center gap-2">
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            isOnline
              ? "bg-green-900 bg-opacity-30 text-green-400"
              : "bg-red-900 bg-opacity-30 text-red-400 animate-pulse"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-green-400" : "bg-red-400"
            }`}
          />
          {isOnline ? "Connected" : "No Connection"}
        </div>
      </div>
    </div>
  );
};
