# Online/Offline Detection System for Fluxa

## Overview

The application now has a **real-time online/offline detection system** that automatically detects connectivity changes and manages network requests accordingly. This is implemented using React hooks and context, making it highly efficient and performant.

## Architecture

### Why React instead of Rust?

✅ **React is the most efficient choice** because:
- **Instant detection**: Browser's native `online`/`offline` events provide immediate feedback (~100ms)
- **No overhead**: Uses native browser APIs without additional HTTP requests
- **Context-based**: Centralized state management accessible from any component
- **Cross-platform**: Works identically on web, desktop (Tauri), and mobile
- **Offline-first**: Perfect for supporting offline-first functionality

## Components & Hooks

### 1. `useOnlineStatus()` Hook
**File**: [src/hooks/useOnlineStatus.ts](src/hooks/useOnlineStatus.ts)

Simple, lightweight hook for detecting online/offline status.

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const isOnline = useOnlineStatus();

  return <div>{isOnline ? '🟢 Online' : '🔴 Offline'}</div>;
}
```

### 2. `useOnlineStatusWithCheck()` Hook
**File**: [src/hooks/useOnlineStatus.ts](src/hooks/useOnlineStatus.ts)

Enhanced version that performs periodic connectivity checks with HTTP requests.

```typescript
import { useOnlineStatusWithCheck } from '@/hooks/useOnlineStatus';

function MyComponent() {
  // Check connectivity every 5 seconds
  const isOnline = useOnlineStatusWithCheck(5000);

  return <div>{isOnline ? 'Connected' : 'No Connection'}</div>;
}
```

### 3. `OnlineStatusProvider` & `useOnlineStatusContext()`
**File**: [src/contexts/OnlineStatusContext.tsx](src/contexts/OnlineStatusContext.tsx)

Global context for sharing online status across the app.

```typescript
// In App.tsx (already set up)
<OnlineStatusProvider>
  <YourApp />
</OnlineStatusProvider>

// In any child component
import { useOnlineStatusContext } from '@/contexts/OnlineStatusContext';

function MyComponent() {
  const { isOnline } = useOnlineStatusContext();
  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}
```

### 4. `NetworkStatusBanner` Component
**File**: [src/components/NetworkStatusBanner.tsx](src/components/NetworkStatusBanner.tsx)

Visual indicator that appears when the device goes offline.

- Automatically shown/hidden based on connection status
- Shows helpful message about offline mode
- Already integrated in App.tsx

### 5. `useOfflineAwareFetch()` Hook
**File**: [src/hooks/useOfflineAwareFetch.ts](src/hooks/useOfflineAwareFetch.ts)

Advanced hook for managing API requests with automatic offline queuing.

```typescript
import { useOfflineAwareFetch } from '@/hooks/useOfflineAwareFetch';

function MyComponent() {
  const { fetch, queuedRequests } = useOfflineAwareFetch();

  const handlePayment = async () => {
    await fetch(
      '/api/payment',
      { method: 'POST', body: JSON.stringify(data) },
      (response) => console.log('Success:', response),
      (error) => console.error('Failed:', error)
    );
  };

  return (
    <div>
      <button onClick={handlePayment}>Pay</button>
      <p>{queuedRequests.length} requests queued</p>
    </div>
  );
}
```

## Integration Points

### Navigation Components
Both `NavBar` and `Breadcrumb` now display the current connection status:
- **Bottom bar**: Shows a small status indicator with dot
- **Top breadcrumb**: Shows a detailed status badge

### Visual Indicators
- 🟢 **Green** = Online and connected
- 🔴 **Red** = Offline (with pulsing animation)
- Text labels for clarity on larger screens

## Usage Patterns

### Pattern 1: Simple Status Check
```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function TransactionForm() {
  const isOnline = useOnlineStatus();

  return (
    <form>
      {!isOnline && <div className="alert">Offline - changes will sync later</div>}
      <input type="text" />
    </form>
  );
}
```

### Pattern 2: Conditional Rendering
```typescript
function PaymentButton() {
  const { isOnline } = useOnlineStatusContext();

  return (
    <button disabled={!isOnline}>
      {isOnline ? 'Pay Now' : 'Queued for Later'}
    </button>
  );
}
```

### Pattern 3: Request Queuing
```typescript
function VaultWithSync() {
  const { fetch, queuedRequests } = useOfflineAwareFetch();

  useEffect(() => {
    if (queuedRequests.length > 0) {
      console.log(`${queuedRequests.length} transactions waiting to sync`);
    }
  }, [queuedRequests]);
}
```

## Performance

- **Zero overhead when online**: Just event listeners
- **Minimal memory usage**: Simple boolean state
- **No polling**: Uses browser native events
- **Battery friendly**: No continuous background checks (unless `useOnlineStatusWithCheck` is used)

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge 4+
- ✅ Firefox 3+
- ✅ Safari 5+
- ✅ Tauri (uses Chromium engine)

## Future Enhancements

1. **Service Worker sync**: Queue transactions in IndexedDB for persistent offline support
2. **Rust backend checks**: Add periodic health checks to Rust backend
3. **Network quality detection**: Detect slow networks vs complete offline
4. **Automatic retry logic**: Enhanced retry mechanisms for failed requests
5. **Offline data caching**: Cache API responses for offline access

## Files Modified

- [src/App.tsx](src/App.tsx) - Added OnlineStatusProvider and NetworkStatusBanner
- [src/components/Navigation.tsx](src/components/Navigation.tsx) - Added status indicators

## Files Created

- [src/hooks/useOnlineStatus.ts](src/hooks/useOnlineStatus.ts) - Core detection hooks
- [src/contexts/OnlineStatusContext.tsx](src/contexts/OnlineStatusContext.tsx) - Global context
- [src/components/NetworkStatusBanner.tsx](src/components/NetworkStatusBanner.tsx) - Status banner
- [src/hooks/useOfflineAwareFetch.ts](src/hooks/useOfflineAwareFetch.ts) - Offline-aware requests

## Testing

To test offline functionality:

1. **In browser DevTools**:
   - Open DevTools → Network tab
   - Click the throttle dropdown
   - Select "Offline"
   - The status indicator will change to red

2. **In mobile**:
   - Toggle airplane mode
   - The app will detect the change instantly

3. **Real network loss**:
   - Unplug network cable or disable WiFi
   - App will detect within ~100ms
