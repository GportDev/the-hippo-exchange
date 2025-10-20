const DEFAULT_API_BASE_URL = "http://localhost:8080";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const sanitizedBaseUrl = rawBaseUrl?.replace(/\/+$/, "");
const isValidBaseUrl = sanitizedBaseUrl && /^https?:\/\//i.test(sanitizedBaseUrl);

if (sanitizedBaseUrl && !isValidBaseUrl) {
  // Fallback to default but surface misconfiguration for easier debugging.
  console.warn(
    `[api] Ignoring invalid VITE_API_BASE_URL value (${sanitizedBaseUrl}). Falling back to ${DEFAULT_API_BASE_URL}.`,
  );
}

export const API_BASE_URL = isValidBaseUrl ? sanitizedBaseUrl! : DEFAULT_API_BASE_URL;

export const CLERK_JWT_TEMPLATE = import.meta.env.VITE_CLERK_JWT_TEMPLATE;

/** Normalises relative API paths to the configured service base URL. */
export function buildApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
