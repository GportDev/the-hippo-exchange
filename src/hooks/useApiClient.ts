import { useAuth, useClerk } from "@clerk/clerk-react";
import { useCallback } from "react";

import { buildApiUrl, CLERK_JWT_TEMPLATE } from "@/lib/api";

type RequestOptions = RequestInit & {
  skipJsonParsing?: boolean;
};

/**
 * Returns a memoised fetch helper that automatically injects a Clerk session token
 * and normalises JSON handling. Consumers should use this for any authenticated
 * request to the Hippo Exchange API.
 */
export function useApiClient() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();

  return useCallback(
    async <T = unknown>(path: string, options: RequestOptions = {}): Promise<T> => {
      const { skipJsonParsing, ...requestInit } = options;
      const token = await getToken(
        CLERK_JWT_TEMPLATE ? { template: CLERK_JWT_TEMPLATE } : undefined,
      );

      if (!token) {
        throw new Error("Authentication token not available.");
      }

      const headers = new Headers(requestInit.headers ?? {});
      const isFormData = requestInit.body instanceof FormData;

      if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(buildApiUrl(path), {
        ...requestInit,
        headers,
        credentials: requestInit.credentials ?? "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut();
        }
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      if (skipJsonParsing || response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    },
    [getToken, signOut],
  );
}
