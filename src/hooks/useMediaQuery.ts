import { useEffect, useState } from "react";

/**
 * Hook to subscribe to a CSS media query.
 * Returns `true` when the document matches the provided query.
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const mediaQueryList = window.matchMedia(query);
		const handleChange = () => setMatches(mediaQueryList.matches);

		handleChange();

		if (typeof mediaQueryList.addEventListener === "function") {
			mediaQueryList.addEventListener("change", handleChange);
			return () => mediaQueryList.removeEventListener("change", handleChange);
		}

		// Fallback for older browsers
		// eslint-disable-next-line deprecation/deprecation
		mediaQueryList.addListener(handleChange);
		return () => {
			// eslint-disable-next-line deprecation/deprecation
			mediaQueryList.removeListener(handleChange);
		};
	}, [query]);

	return matches;
}
