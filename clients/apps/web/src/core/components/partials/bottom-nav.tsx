import {
	RiBookmarkLine,
	RiChat3Line,
	RiHome5Line,
	RiNotification3Line,
	RiSearchLine,
	RiSettings3Line,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";

export function BottomNav() {
	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-md flex justify-around p-2 z-40">
			<Link
				to="/home"
				className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiHome5Line className="h-6 w-6" />
			</Link>
			<Link
				to="/search"
				className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiSearchLine className="h-6 w-6" />
			</Link>
			<Link
				to="/notifications"
				className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiNotification3Line className="h-6 w-6" />
			</Link>
			<Link
				to="/discussions"
				className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiChat3Line className="h-6 w-6" />
			</Link>
			<Link
				to="/bookmark-collections"
				className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiBookmarkLine className="h-6 w-6" />
			</Link>
			<Link
				to="/settings"
				aria-label="Settings"
				className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiSettings3Line className="h-6 w-6" />
			</Link>
		</nav>
	);
}
