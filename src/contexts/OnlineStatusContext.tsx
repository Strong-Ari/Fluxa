import React, { createContext, useContext } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * Online status context
 */
interface OnlineStatusContextType {
  isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(
  undefined
);

/**
 * Provider component for online status
 * Wrap your app with this provider to access online status globally
 * Uses aggressive polling for mobile device compatibility
 */
export const OnlineStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use aggressive polling (3-second interval) for better mobile support
  const isOnline = useOnlineStatus();

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

/**
 * Hook to use online status in any component
 * Must be used inside OnlineStatusProvider
 */
export const useOnlineStatusContext = (): OnlineStatusContextType => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error(
      "useOnlineStatusContext must be used within OnlineStatusProvider"
    );
  }
  return context;
};
