import { useEffect, useState } from "react";

/**
 * A hook that returns `true` once the component has mounted on the client.
 * This is useful for preventing server-side rendering of client-only components
 * to avoid hydration mismatches.
 */
export function useIsClient() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	return isClient;
}
