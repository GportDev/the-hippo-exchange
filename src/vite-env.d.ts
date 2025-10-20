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

export {};
