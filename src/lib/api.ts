export const API_BASE_URL = "/api";

export async function authedFetch(getToken: () => Promise<string | null>, url: string, options: RequestInit = {}) {
  const token = await getToken();
  if (!token) {
    // This can happen if the user is signed out.
    // The caller should handle this case, perhaps by redirecting to sign-in.
    throw new Error("Authentication token not available.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("API Error:", response.status, errorBody);
    throw new Error(`Request failed with status ${response.status}: ${errorBody}`);
  }

  // If the response has no content, don't try to parse it as JSON.
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return null;
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json();
  }
  
  // For non-JSON responses, return the raw response object.
  return response;
}


