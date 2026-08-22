import {
	type RemixiconComponentType,
	RiBookmarkLine,
	RiChat3Line,
	RiHome5Line,
	RiNotification3Line,
	RiSearchLine,
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
};

function SidebarLink({ to, icon: Icon, label, params }: SidebarLinkProps) {
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
		</Link>
	);
}

export function Sidebar() {
	const { data: user } = useAuthenticatedUser();

	return (
		<aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 p-4 h-screen sticky top-0 shrink-0">
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
					/>
					<SidebarLink
						to="/discussions"
						icon={RiChat3Line}
						label="Discussions"
					/>
					<SidebarLink
						to="/bookmarks"
						icon={RiBookmarkLine}
						label="Bookmarks"
					/>
					{user ? (
						<SidebarLink
							to="/$username"
							params={{ username: `@${user.username}` }}
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

export { SidebarLink };
export type { SidebarLinkProps };
