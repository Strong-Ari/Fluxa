import { useOnlineStatusContext } from "../contexts/OnlineStatusContext";

/**
 * Network status banner component
 * Shows when the device is offline
 */
export const NetworkStatusBanner: React.FC = () => {
  const { isOnline } = useOnlineStatusContext();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-900 bg-opacity-80 backdrop-blur-sm border-b border-red-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
          <span className="text-white font-grotesk font-bold">
            No internet connection. Operating in offline mode.
          </span>
        </div>
        <span className="text-xs text-red-200">
          Transactions will be queued and synced when connection is restored
        </span>
      </div>
    </div>
  );
};
