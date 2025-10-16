export const API_BASE_URL = "https://api.thehippoexchange.com";

const API_KEY = import.meta.env.VITE_API_KEY;

function getRequiredApiKey(): string {
    if (!API_KEY) {
        throw new Error(
            "VITE_API_KEY is not configured. Ensure the API key is available to the client before making API requests."
        );
    }
    return API_KEY;
}

/**
 * Builds a Headers object with the authentication requirements for the HippoExchange API.
 * @param userId The Clerk user identifier for the current session.
 * @param headers Optional headers to merge with the authentication headers.
 * @returns A Headers instance that includes X-User-Id and X-Api-Key.
 */
export function buildApiHeaders(userId: string, headers: HeadersInit = {}): Headers {
    if (!userId) {
        throw new Error("A user ID is required to call the HippoExchange API.");
    }

    const mergedHeaders = new Headers(headers);
    mergedHeaders.set("X-User-Id", userId);
    mergedHeaders.set("X-Api-Key", getRequiredApiKey());

    return mergedHeaders;
}

export class ApiError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly details?: unknown;

    constructor(response: Response, details?: unknown) {
        super(`Request failed with status ${response.status}`);
        this.name = "ApiError";
        this.status = response.status;
        this.statusText = response.statusText;
        this.details = details;
    }
}

/**
 * Fetches data from the API using a user ID for authentication.
 * @param userId The user's ID.
 * @param url The URL to fetch.
 * @param options The request options.
 * @returns The JSON response.
 */
export async function apiFetch<T = unknown>(
    userId: string,
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const headers = buildApiHeaders(userId, options.headers);
    const isMultipart = options.body instanceof FormData;
    if (!isMultipart && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let details: unknown;
        try {
            details = await response.json();
        } catch {
            try {
                details = await response.text();
            } catch {
                details = undefined;
            }
        }
        throw new ApiError(response, details);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    if (!text) {
        return undefined as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch (error) {
        console.error("Failed to parse API response as JSON:", error);
        throw error;
    }
}
