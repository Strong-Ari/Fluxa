/**
 * Simple URL-based routing configuration for Fluxa Offline
 * Routes: /#/dashboard, /#/vault, /#/radar, /#/transaction, /#/receipt
 */

export type ScreenType = "dashboard" | "vault" | "radar" | "transaction" | "receipt" | "p2p";

export const ROUTES = {
  dashboard: "/",
  vault: "/vault",
  radar: "/radar",
  transaction: "/transaction",
  receipt: "/receipt",
  p2p: "/p2p",
} as const;

export const ROUTE_NAMES: Record<ScreenType, string> = {
  dashboard: "Dashboard",
  vault: "Le Coffre",
  radar: "Radar de Paiement",
  transaction: "Transaction en Cours",
  receipt: "Reçu de Paiement",
  p2p: "Paiement P2P",
};

/**
 * Get current screen from URL hash
 */
export function getCurrentScreen(): ScreenType {
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

  return routeMap[hash] || "dashboard";
}

/**
 * Navigate to a screen and update URL
 */
export function navigateTo(screen: ScreenType) {
  const route = ROUTES[screen];
  window.location.hash = route;
}

/**
 * Get the full URL for a screen
 */
export function getRouteUrl(screen: ScreenType): string {
  const route = ROUTES[screen];
  return `#${route}`;
}
