import Header from "@/components/Header";
import Navbar from "@/components/NavBar";
import ClerkProvider from "@/integrations/clerk/provider";
import {
	Outlet,
	createRootRouteWithContext,
	useLocation,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

import NotFoundComponent from "@/pages/NotFoundPage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

function RootComponent() {
	const location = useLocation();
	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Initial load - sidebar is collapsed by default for hover UX
		setSidebarExpanded(false);
	}, []);

	const handleMouseEnter = () => {
		// Clear any pending leave timeout
		if (leaveTimeoutRef.current) {
			clearTimeout(leaveTimeoutRef.current);
			leaveTimeoutRef.current = null;
		}

		// Quick delay before expanding - snappy but intentional
		hoverTimeoutRef.current = setTimeout(() => {
			setSidebarExpanded(true);
		}, 75); // 75ms - faster response while preventing accidental triggers
	};

	const handleMouseLeave = () => {
		// Clear any pending enter timeout
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}

		// Very quick collapse for snappy UX
		leaveTimeoutRef.current = setTimeout(() => {
			setSidebarExpanded(false);
		}, 50); // 50ms - just enough to allow smooth mouse movements
	};

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
			if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
		};
	}, []);

	// Check if current route should hide the header
	const shouldHideHeader =
		location.pathname === "/sign-in" ||
		location.pathname === "/sign-up" ||
		location.pathname === "/verify-email";

	return (
		<div className="min-h-screen bg-background">
			<Toaster position="bottom-right" reverseOrder={false} />
			<SignedIn>
				<main className="flex flex-col h-screen overflow-hidden">
					{!shouldHideHeader && <Header />}
					<div className="flex flex-1 overflow-hidden">
						<Navbar
							isExpanded={sidebarExpanded}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
						/>
						<div className="flex-1 overflow-y-scroll overflow-x-hidden bg-gray-50">
							<Outlet />
						</div>
					</div>
				</main>
			</SignedIn>
			<SignedOut>
				<div className="flex flex-col min-h-screen">
					{!shouldHideHeader && <Header />}
					<div className="flex-1">
						<Outlet />
					</div>
				</div>
			</SignedOut>
		</div>
	);
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<ClerkProvider>
				<RootComponent />
			</ClerkProvider>
		</>
	),
	notFoundComponent: NotFoundComponent,
});
