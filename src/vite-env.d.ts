/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PULSE_API_URL: string;
  readonly VITE_PULSE_DEFAULT_CONTOUR: string;
  readonly VITE_PULSE_MONITOR_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
