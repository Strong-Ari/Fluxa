# Fluxa AI Coding Instructions

## Project Overview

**Fluxa** is a hybrid Tauri + React application implementing an offline-first P2P payment system with Bluetooth/NFC support. It features dual-balance wallet architecture (online/offline), cryptographic transaction signing, and service worker-based offline-first capabilities.

**Key Stack:** TypeScript + React 19, Tauri 2, Rust backend, Tailwind CSS, Vite

---

## Architecture Overview

### Frontend-Backend Communication Pattern

Tauri commands bridge React components to Rust backend via `invoke()`:

```typescript
// Frontend (React/TypeScript)
import { invoke } from "@tauri-apps/api/core";
const wallet = await invoke("get_wallet");  // Calls Rust function

// Backend (src-tauri/src/lib.rs)
#[tauri::command]
pub fn get_wallet(state: tauri::State<Mutex<BankingEngine>>) -> Wallet { ... }
```

**All Rust commands are centralized in:** `../src/config/fluxa.config.ts`

- Commands organized by domain (wallet, transaction, keys)
- Validation constraints (minAmount, maxAmount, timeout)
- Error/success message enums in French

### Dual-Balance Wallet Model

Each wallet has **two independent balances**:

- `onlineBalance`: Cloud-synchronized balance (requires internet)
- `offlineBalance`: Vault stored locally (works offline)

Users deliberately transfer between them:

- `transferToVault(amount)`: Online → Offline (store locally)
- `transferFromVault(amount)`: Offline → Online (sync to cloud)

**Why this matters:** Enables pure offline transactions by pre-storing funds locally.

### Network Detection & Offline-First Strategy

**Detection Hook:** `../src/hooks/useOnlineStatus.ts`

- Aggressive polling (3-second intervals) + native browser events
- Handles mobile device quirks (WiFi off vs Mode Avion)
- Returns boolean `isOnline` value

**Global Context:** `../src/contexts/OnlineStatusContext.tsx`

- Wraps entire app (see App.tsx)
- Any component can call `useOnlineStatusContext()` to check connectivity
- Drives UI state (banners, indicators, button disabling)

**Service Worker:** `../public/sw.js`

- Network-first strategy: tries network, falls back to cache
- Pre-caches assets for offline load
- Updates checked every 60 seconds

---

## Development Workflows

### Running the App

```bash
# Install dependencies (uses pnpm)
pnpm install

# Development mode (hot reload, both frontend + Rust)
pnpm run tauri dev
# Frontend dev server runs on localhost:1420

# Build for production (desktop)
pnpm run tauri build
# Output in src-tauri/target/release/

# Frontend-only development (Vite)
pnpm run dev
# Runs on localhost:1420 (requires Tauri runtime separately)
```

### Testing Offline Functionality

1. **On Desktop:** DevTools → Network tab → Select "Offline" from dropdown
2. **On Mobile:** Disable WiFi or toggle Airplane Mode
3. **Verification:** Red indicator appears in UI within 3 seconds

### Debugging Rust Backend

- Console output: `RUST_LOG=debug pnpm run tauri dev`
- Tauri DevTools: Right-click in app window → Inspect Element
- Transaction logs: Check `src-tauri/src/lib.rs` `BankingEngine` state

---

## Critical Project Patterns

### Transaction State Machine

Every transaction follows this flow:

```typescript
// src/hooks/useTransaction.ts
type Status = "pending" | "processing" | "completed" | "failed";

// Online transaction: pending → processing → completed
// Offline transaction: pending → confirmed (immediate)
```

**Key invariant:** Offline transactions are cryptographically signed at creation; online ones require backend confirmation. Do not mix these paths.

### React Component → Rust Data Flow

1. **Component calls hook** (e.g., `useWallet()`)
2. **Hook invokes Tauri command** (e.g., `invoke("get_wallet")`)
3. **Rust backend updates state** (BankingEngine Mutex)
4. **Response serialized as JSON** (Serde Serialize/Deserialize)
5. **Hook updates React state** → component re-renders

**Never bypass this pattern:** Direct localStorage access or manual Rust state modifications break transaction atomicity.

### Bluetooth/NFC P2P Communication

**Hook:** `../src/hooks/useBluetoothNFC.ts` abstracts device discovery and transaction relay.

```typescript
// High-level API
const { startScan, connectDevice, sendTransaction } = useBluetoothNFC();

// Underlying: Tauri command calls Rust BLE stack → device sends signed TX
// Receiver automatically invokes confirmTransaction in Rust
```

**Important:** NFC and Bluetooth use separate code paths but unified TX format. Do not assume one works if other fails.

---

## Component Organization & Key Files

| Layer            | Key Files                                                                                                 | Purpose                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **Screens**      | `Dashboard`, `VaultScreen`, `PaymentRadar`, `P2PPaymentScreen`, `TransactionInProgress`, `PaymentReceipt` | Page-level routing containers                   |
| **Components**   | `Navigation`, `NetworkStatusBanner`, `WalletInitializer`, `DebugNetworkStatus`                            | Reusable UI + infrastructure                    |
| **Hooks**        | `useWallet`, `useTransaction`, `useBluetoothNFC`, `useOnlineStatus`, `useOfflineAwareFetch`               | Business logic & data fetching                  |
| **Contexts**     | `OnlineStatusContext`                                                                                     | Global app state (currently only online status) |
| **Rust Backend** | `../src-tauri/src/lib.rs` (844 lines)                                                                     | BankingEngine: wallet, transactions, crypto     |

---

## Language & Localization

**UI text is entirely in French.** All user-facing strings, error messages, and labels use French.

- Error messages: `../src/config/fluxa.config.ts` `messages.error` object
- Components use these centralized messages (e.g., `FLUXA_CONFIG.messages.error.insufficientBalance`)

**When adding features:** Always provide French translations. Do not commit English-only messages to UI.

---

## Configuration & Secrets

**Tauri Config:** `../src-tauri/tauri.conf.json`

- App identifier: `com.rust.fluxa`
- Dev URL: `http://localhost:1420`
- Security: CSP is null (permissive for development)

**No secrets stored in repo.** Wallet IDs and keys are generated at runtime in Rust memory or IndexedDB.

---

## Common Gotchas & Anti-Patterns

❌ **Don't:**

- Call `invoke()` directly in component render (causes infinite loops) → use hooks instead
- Assume online balance ≥ offline balance (users control transfers)
- Ignore `useOnlineStatus()` when making API calls → breaks offline UX
- Mix Tauri `invoke()` with fetch() for same data (inconsistent state)
- Modify BankingEngine state directly in Rust (not thread-safe) → use Mutex

✅ **Do:**

- Use hooks (`useWallet`, `useTransaction`) as the single source of truth
- Check `isOnline` before initiating online transactions
- Queue failed transactions via `useOfflineAwareFetch()` for retry when online
- Write Rust functions in `../src-tauri/src/lib.rs` and expose via `#[tauri::command]`
- Test both online and offline code paths

---

## Debugging Tips

1. **Network Status:** Click 🐛 icon (bottom-right) → `DebugNetworkStatus` component shows real-time state
2. **Wallet State:** Check `useWallet()` hook value in React DevTools
3. **Transactions:** Inspect `useTransaction()` state for pending/processing/failed
4. **Rust Logs:** Run `RUST_LOG=debug pnpm tauri dev` to see backend output
5. **Service Worker:** DevTools → Application tab → check Service Workers registration

---

## File Editing Guidelines

- **Frontend files:** TypeScript + React, Tailwind for styling (no inline CSS)
- **Rust files:** Follow existing BankingEngine patterns; use `Mutex` for shared state
- **Config changes:** Update both `../src/config/fluxa.config.ts` (TS interface) and Rust backend
- **Error handling:** Always include French error messages for user visibility
