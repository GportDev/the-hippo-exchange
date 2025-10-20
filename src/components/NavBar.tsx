import { useIsClient } from "@/hooks/useIsClient.ts";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import * as Lucide from "lucide-react";
import ClerkHeader from "../integrations/clerk/header-user.tsx";

interface NavbarProps {
	isExpanded: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

function Navbar({ isExpanded, onMouseEnter, onMouseLeave }: NavbarProps) {
	const isClient = useIsClient();

	if (!isClient) {
		return null;
	}

	return (
		<>
			<SignedIn>
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
					<div className="flex flex-col h-full">
						{/* Navigation links */}
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
									title={!isExpanded ? "My Assets" : undefined}
								>
									<span className="w-16 flex-shrink-0 flex items-center justify-center">
										<Lucide.House size="1.2em" />
									</span>
									<span
										className={`overflow-hidden whitespace-nowrap select-none ${
											isExpanded
												? "opacity-100 translate-x-0 max-w-[160px] ml-2"
												: "opacity-0 -translate-x-2 max-w-0 ml-0"
										} transition-all duration-300 ease-in-out`}
										aria-hidden={!isExpanded}
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
									title={!isExpanded ? "My Assets" : undefined}
								>
									<span className="w-16 flex-shrink-0 flex items-center justify-center">
										<Lucide.Package size="1.2em" />
									</span>
									<span
										className={`overflow-hidden whitespace-nowrap select-none ${
											isExpanded
												? "opacity-100 translate-x-0 max-w-[160px] ml-2"
												: "opacity-0 -translate-x-2 max-w-0 ml-0"
										} transition-all duration-300 ease-in-out`}
										aria-hidden={!isExpanded}
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
									title={!isExpanded ? "Maintenance" : undefined}
								>
									<span className="w-16 flex-shrink-0 flex items-center justify-center">
										<Lucide.Wrench size="1.2em" />
									</span>
									<span
										className={`overflow-hidden whitespace-nowrap select-none ${
											isExpanded
												? "opacity-100 translate-x-0 max-w-[160px] ml-2"
												: "opacity-0 -translate-x-2 max-w-0 ml-0"
										} transition-all duration-300 ease-in-out`}
										aria-hidden={!isExpanded}
									>
										Maintenance
									</span>
								</Link>
							</li>
						</ul>

						<ClerkHeader
							className={`mt-auto mb-0 ${isExpanded ? "" : ""}`}
							isNavExpanded={isExpanded}
						/>
					</div>
				</nav>
			</SignedIn>

			<SignedOut>{/* Don't render sidebar for signed out users */}</SignedOut>
		</>
	);
}

export default Navbar;
