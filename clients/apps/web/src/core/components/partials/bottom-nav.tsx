import {
	RiBookmarkLine,
	RiChat3Line,
	RiHome5Line,
	RiNotification3Line,
	RiPlayCircleLine,
	RiSearchLine,
	RiSettings3Line,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export function BottomNav() {
	const { data } = useAuthenticatedUser();
	const unseenNotificationsCount = data?.user.unseenNotificationsCount ?? 0;

	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-md flex justify-around p-2 z-40">
			<Link
				to="/home"
				className="p-2 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiHome5Line className="h-6 w-6" />
			</Link>
			<Link
				to="/search"
				className="p-2 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiSearchLine className="h-6 w-6" />
			</Link>
			<Link
				to="/chillz"
				aria-label="Chillz"
				className="p-2 text-muted-foreground transition-colors hover:text-sky-500"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiPlayCircleLine className="size-6" />
			</Link>
			<Link
				to="/notifications"
				className="relative p-2 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiNotification3Line className="h-6 w-6" />
				{unseenNotificationsCount > 0 ? (
					<span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
						{unseenNotificationsCount > 99 ? "99+" : unseenNotificationsCount}
					</span>
				) : null}
			</Link>
			<Link
				to="/discussions"
				className="p-2 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiChat3Line className="h-6 w-6" />
			</Link>
			<Link
				to="/bookmark-collections"
				className="p-2 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiBookmarkLine className="h-6 w-6" />
			</Link>
			<Link
				to="/settings"
				aria-label="Settings"
				className="p-2 text-muted-foreground hover:text-sky-500 transition-colors"
				activeProps={{ className: "text-sky-500" }}
			>
				<RiSettings3Line className="h-6 w-6" />
			</Link>
		</nav>
	);
}
