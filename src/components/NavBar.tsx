import { useIsClient } from "@/hooks/useIsClient.ts";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import * as Lucide from "lucide-react";
import ClerkHeader from "../integrations/clerk/header-user.tsx";

interface NavbarProps {
	isExpanded: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onToggle?: () => void;
	isMobile?: boolean;
}

function Navbar({
	isExpanded,
	onMouseEnter,
	onMouseLeave,
	onToggle,
	isMobile = false,
}: NavbarProps) {
	const isClient = useIsClient();

	if (!isClient) {
		return null;
	}

	const handleLinkClick = () => {
		if (isMobile && onToggle) {
			onToggle();
		}
	};

	const navContent = (
		<div className="flex flex-col h-full">
			<ul
				className={
					"flex flex-col pt-4 items-start border-t border-primary-yellow/10"
				}
			>
				<li className="mb-2 w-full">
					<Link
						to="/home"
						className={
							"w-full flex items-center py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200"
						}
						title={!isExpanded && !isMobile ? "My Assets" : undefined}
						onClick={handleLinkClick}
					>
						<span className="w-16 flex-shrink-0 flex items-center justify-center">
							<Lucide.House size="1.2em" />
						</span>
						<span
							className={`overflow-hidden whitespace-nowrap select-none ${
								isExpanded || isMobile
									? "opacity-100 translate-x-0 max-w-[160px] ml-2"
									: "opacity-0 -translate-x-2 max-w-0 ml-0"
							} transition-all duration-300 ease-in-out`}
							aria-hidden={!isExpanded && !isMobile}
						>
							Home
						</span>
					</Link>
				</li>
				<li className="mb-2 w-full">
					<Link
						to="/assets/my-assets"
						className={
							"w-full flex items-center py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200"
						}
						title={!isExpanded && !isMobile ? "My Assets" : undefined}
						onClick={handleLinkClick}
					>
						<span className="w-16 flex-shrink-0 flex items-center justify-center">
							<Lucide.Package size="1.2em" />
						</span>
						<span
							className={`overflow-hidden whitespace-nowrap select-none ${
								isExpanded || isMobile
									? "opacity-100 translate-x-0 max-w-[160px] ml-2"
									: "opacity-0 -translate-x-2 max-w-0 ml-0"
							} transition-all duration-300 ease-in-out`}
							aria-hidden={!isExpanded && !isMobile}
						>
							My Assets
						</span>
					</Link>
				</li>
				<li className="mb-2 w-full">
					<Link
						to="/maintenance"
						search={{ filter: "all" }}
						className={
							"w-full flex items-center py-3 text-primary-yellow hover:bg-primary-yellow hover:text-primary-gray transition-colors duration-200"
						}
						title={!isExpanded && !isMobile ? "Maintenance" : undefined}
						onClick={handleLinkClick}
					>
						<span className="w-16 flex-shrink-0 flex items-center justify-center">
							<Lucide.Wrench size="1.2em" />
						</span>
						<span
							className={`overflow-hidden whitespace-nowrap select-none ${
								isExpanded || isMobile
									? "opacity-100 translate-x-0 max-w-[160px] ml-2"
									: "opacity-0 -translate-x-2 max-w-0 ml-0"
							} transition-all duration-300 ease-in-out`}
							aria-hidden={!isExpanded && !isMobile}
						>
							Maintenance
						</span>
					</Link>
				</li>
			</ul>

			<ClerkHeader
				className={`mt-auto mb-0 ${isExpanded || isMobile ? "" : ""}`}
				isNavExpanded={isExpanded || isMobile}
			/>
		</div>
	);

	return (
		<>
			<SignedIn>
				{isMobile ? (
					<nav
						id="app-sidebar"
						aria-label="Primary"
						aria-expanded={isExpanded}
						className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-primary-gray text-primary-yellow shadow-lg transition-transform duration-300 ease-in-out ${
							isExpanded ? "translate-x-0" : "-translate-x-full"
						}`}
					>
						<div className="flex items-center justify-between px-4 py-3 border-b border-primary-yellow/10">
							<span className="text-lg font-semibold">Menu</span>
							<button
								type="button"
								onClick={onToggle}
								aria-label="Close navigation menu"
								className="rounded-md p-2 text-primary-yellow transition-colors hover:bg-primary-yellow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-yellow"
							>
								<Lucide.X className="h-5 w-5" />
							</button>
						</div>
						{navContent}
					</nav>
				) : (
					<nav
						id="app-sidebar"
						aria-label="Primary"
						aria-expanded={isExpanded}
						data-expanded={isExpanded}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						className={`h-full bg-primary-gray text-primary-yellow transition-all duration-300 ease-in-out z-40 overflow-visible ${
							isExpanded ? "w-64" : "w-16"
						}`}
					>
						{navContent}
					</nav>
				)}
			</SignedIn>

			<SignedOut>{/* Don't render sidebar for signed out users */}</SignedOut>
		</>
	);
}

export default Navbar;
