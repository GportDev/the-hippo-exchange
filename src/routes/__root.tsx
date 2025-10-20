import Header from "@/components/Header";
import Navbar from "@/components/NavBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
	const { pathname } = location;
	const [sidebarExpanded, setSidebarExpanded] = useState(false);
	const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isMobile = useMediaQuery("(max-width: 768px)");

	useEffect(() => {
		// Initial load - sidebar is collapsed by default for hover UX
		setSidebarExpanded(false);
	}, []);

	const handleMouseEnter = () => {
		if (isMobile) return;

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
		if (isMobile) return;

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

	useEffect(() => {
		if (!isMobile) {
			setSidebarExpanded(false);
		}
	}, [isMobile]);

	useEffect(() => {
		if (!isMobile) {
			return;
		}
		// React to navigation changes on mobile by closing the sidebar.
		void pathname;
		setSidebarExpanded(false);
	}, [isMobile, pathname]);

	const toggleSidebar = () => {
		if (!isMobile) return;
		setSidebarExpanded((prev) => !prev);
	};

	const closeSidebar = () => {
		setSidebarExpanded(false);
	};

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
					{!shouldHideHeader && (
						<Header
							onToggleSidebar={toggleSidebar}
							isSidebarOpen={sidebarExpanded}
							showMenuButton={isMobile}
						/>
					)}
					<div className="flex flex-1 overflow-hidden">
						<Navbar
							isExpanded={sidebarExpanded}
							onMouseEnter={handleMouseEnter}
							onMouseLeave={handleMouseLeave}
							onToggle={closeSidebar}
							isMobile={isMobile}
						/>
						{isMobile && sidebarExpanded && (
							<button
								type="button"
								aria-label="Close navigation menu"
								onClick={closeSidebar}
								className="fixed inset-0 z-40 bg-black/40"
							/>
						)}
						<div className="flex-1 overflow-y-scroll overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
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
