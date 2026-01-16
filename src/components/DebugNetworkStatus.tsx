import { useOnlineStatusContext } from "../contexts/OnlineStatusContext";
import { useServiceWorkerStatus } from "../hooks/useServiceWorkerStatus";
import { useState } from "react";

/**
 * Debug component to show network and offline capabilities status
 * Only shown in development mode
 */
export const DebugNetworkStatus: React.FC = () => {
  const { isOnline } = useOnlineStatusContext();
  const swStatus = useServiceWorkerStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-40 right-4 z-40 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-xs font-bold shadow-lg transition-all"
        title="Network Debug Info"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed bottom-40 right-4 z-50 bg-gray-900 border border-purple-500 rounded-lg p-4 text-xs text-white max-w-xs shadow-2xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-500">
        <span className="font-bold">Network Debug</span>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-purple-300 hover:text-purple-100"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`} />
          <span>
            <strong>Online:</strong> {isOnline ? "✓ Yes" : "✗ No"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              swStatus.isActive ? "bg-blue-400" : "bg-yellow-400"
            }`}
          />
          <span>
            <strong>Service Worker:</strong> {swStatus.isActive ? "✓ Active" : "○ Inactive"}
          </span>
        </div>

        <div className="text-gray-400 mt-2 p-2 bg-gray-800 rounded">
          {swStatus.message}
        </div>

        <div className="text-gray-400 mt-2 text-[10px] space-y-1">
          <div>
            <strong>navigator.onLine:</strong> {navigator.onLine ? "true" : "false"}
          </div>
          <div>
            <strong>Connection:</strong>{" "}
            {(navigator as any).connection?.effectiveType || "unknown"}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-purple-500 text-gray-400 text-[10px]">
          <p>
            When offline, the app will serve cached assets and allow offline
            transactions.
          </p>
        </div>
      </div>
    </div>
  );
};
