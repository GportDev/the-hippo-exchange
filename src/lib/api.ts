export const API_BASE_URL = "https://api.thehippoexchange.com";

/**
 * Fetches data from the API using a user ID for authentication.
 * @param userId The user's ID.
 * @param url The URL to fetch.
 * @param options The request options.
 * @returns The JSON response.
 */
export async function apiFetch(userId: string, url: string, options: RequestInit = {}) {
    // Debug: Log the request details
    console.log("API Request:", {
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'X-User-Id': userId,
        },
        body: options.body
    });

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'X-User-Id': userId,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("API Fetch Error:", errorText);
        throw new Error(`Request failed with status ${response.status}`);
    }

    const text = await response.text();
    if (!text) {
        return null;
    }

    return JSON.parse(text);
}

