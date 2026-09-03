import {
	type RemixiconComponentType,
	RiBookmarkLine,
	RiChat3Line,
	RiHome5Line,
	RiNotification3Line,
	RiSearchLine,
	RiSettings3Line,
	RiUserLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/core/components/partials/logo";
import { Button } from "@/core/components/ui/button.tsx";
import { AuthenticatedUserDropdown } from "@/features/user/authenticated-user/authenticated-user.dropdown.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

type SidebarLinkProps = {
	to: string;
	icon: RemixiconComponentType;
	label: string;
	params?: { username: string };
	badgeCount?: number;
};

function SidebarLink({
	to,
	icon: Icon,
	label,
	params,
	badgeCount = 0,
}: SidebarLinkProps) {
	return (
		<Link
			to={to}
			params={params}
			className="flex items-center gap-4 rounded-md px-4 py-2 font-normal text-muted-foreground transition-colors hover:bg-accent"
			activeProps={{
				className: "text-primary font-semibold",
			}}
		>
			<Icon className="size-6 shrink-0" />
			<span className="text-lg">{label}</span>
			{badgeCount > 0 ? (
				<span className="ml-auto min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
					{badgeCount > 99 ? "99+" : badgeCount}
				</span>
			) : null}
		</Link>
	);
}

export function Sidebar() {
	const { data } = useAuthenticatedUser();

	return (
		<aside className="hidden md:flex flex-col justify-between w-64 lg:w-84 p-4 h-screen sticky top-0 shrink-0">
			<div className="space-y-6">
				{/* Logo at Top */}
				<div className="px-3 py-2">
					<Logo />
				</div>

				{/* Navigation Links */}
				<nav className="space-y-1">
					<SidebarLink to="/home" icon={RiHome5Line} label="Home" />
					<SidebarLink to="/search" icon={RiSearchLine} label="Search" />
					<SidebarLink
						to="/notifications"
						icon={RiNotification3Line}
						label="Notifications"
						badgeCount={data?.user.unseenNotificationsCount}
					/>
					<SidebarLink
						to="/discussions"
						icon={RiChat3Line}
						label="Discussions"
					/>
					<SidebarLink
						to="/bookmark-collections"
						icon={RiBookmarkLine}
						label="Bookmarks"
					/>
					<SidebarLink to="/settings" icon={RiSettings3Line} label="Settings" />
					{data ? (
						<SidebarLink
							to="/$username"
							params={{ username: `@${data.user.username}` }}
							icon={RiUserLine}
							label="Profile"
						/>
					) : null}
				</nav>
			</div>
			<div>
				{/* User Profile / Logout Section at Bottom */}
				<div className="px-2 pb-3">
					<Button size="lg" fullWidth type="button" onClick={() => {}}>
						Post
					</Button>
				</div>
				<div className="pt-4 px-2">
					<AuthenticatedUserDropdown />
				</div>
			</div>
		</aside>
	);
}
