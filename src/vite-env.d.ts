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
  interface ImportMetaEnv {
    readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
    readonly NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
    readonly CLERK_PUBLISHABLE_KEY?: string;
    readonly VITE_CLERK_FRONTEND_API?: string;
    readonly NEXT_PUBLIC_CLERK_FRONTEND_API?: string;
    readonly CLERK_FRONTEND_API?: string;
    readonly VITE_ENABLE_HTTPS?: string;
    readonly VITE_PORT?: string;
    readonly VITE_HOST?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
