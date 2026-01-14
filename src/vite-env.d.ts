/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_THEME: string;
  readonly VITE_COLOR_NAVY: string;
  readonly VITE_COLOR_GOLD: string;
  readonly VITE_COLOR_NEON: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_CRASH_REPORTING: string;
  readonly VITE_ENABLE_HAPTIC_FEEDBACK: string;
  readonly VITE_ENABLE_LOCAL_ENCRYPTION: string;
  readonly VITE_BLE_ENABLED: string;
  readonly VITE_SIGNATURE_ALGORITHM: string;
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
