import { ScreenType, ROUTE_NAMES, getRouteUrl } from "../router/routes";

interface NavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentScreen, onNavigate }) => {
  const screens: ScreenType[] = ["dashboard", "vault", "radar"];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card mx-4 mb-4 rounded-2xl border-t border-glass-border">
      <div className="flex items-center justify-around py-4">
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
    </div>
  );
};
