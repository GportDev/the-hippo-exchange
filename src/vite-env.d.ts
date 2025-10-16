/// <reference types="vite/client" />

// Extend Window interface to include Clerk
declare global {
  interface Window {
    Clerk?: {
      user: unknown | null;
      session: unknown | null;
      loaded: boolean;
    };
  }
}

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
