import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

interface HeaderProps {
	onToggleSidebar?: () => void;
	isSidebarOpen?: boolean;
	showMenuButton?: boolean;
}

export default function Header({
	onToggleSidebar,
	isSidebarOpen = false,
	showMenuButton = false,
}: HeaderProps) {
	return (
		<header className="px-4 py-2 flex items-center gap-2 bg-primary-gray text-primary-yellow justify-between flex-shrink-0">
			<div className="flex items-center gap-4">
				{showMenuButton && onToggleSidebar && (
					<SignedIn>
						<button
							type="button"
							onClick={onToggleSidebar}
							aria-label="Toggle navigation menu"
							aria-expanded={isSidebarOpen}
							aria-controls="app-sidebar"
							className="inline-flex items-center justify-center rounded-md border border-primary-yellow/40 bg-primary-gray px-2 py-2 text-primary-yellow transition-colors hover:bg-primary-yellow/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-yellow"
						>
							<Menu className="h-5 w-5" />
						</button>
					</SignedIn>
				)}
				<Link to="/" className="flex items-center gap-2">
					<h1 className="text-3xl font-bold">Hippo Exchange</h1>
				</Link>
			</div>
			<SignedOut>
				<SignInButton>
					<button
						type="button"
						className="bg-primary-gray text-primary-yellow px-4 py-2 rounded-md font-semibold text-lg mr-4 hover:bg-primary-yellow hover:text-primary-gray transition-colors"
					>
						Sign In
					</button>
				</SignInButton>
			</SignedOut>
		</header>
	);
}
