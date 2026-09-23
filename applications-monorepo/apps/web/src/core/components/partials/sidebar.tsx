import {
	type RemixiconComponentType,
	RiAddLine,
	RiBookmarkLine,
	// RiChat3Line, // Module de discussion temporairement désactivé.
	RiHome5Line,
	RiNotification3Line,
	RiSearchLine,
	RiSettings3Line,
	RiUserLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/core/components/partials/logo";
import { Button } from "@/core/components/ui/button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { CreatePostModal } from "@/features/post/create-post/create-post.modal.tsx";
import { AuthenticatedUserDropdown } from "@/features/user/authenticated-user/authenticated-user.dropdown.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { m } from "@/paraglide/messages.js";
import { IconButton } from "../ui/icon-button";

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
			aria-label={label}
			title={label}
			className="relative flex items-center justify-center rounded-md w-max lg:w-full mx-auto px-3 py-2 font-normal text-muted-foreground transition-colors hover:bg-accent lg:justify-start lg:gap-4 lg:px-4"
			activeProps={{
				className: "text-primary font-semibold",
			}}
		>
			<Icon className="size-6 shrink-0" aria-hidden="true" />
			<span className="hidden text-lg lg:inline">{label}</span>
			{badgeCount > 0 ? (
				<span className="absolute right-0 top-0 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] font-semibold text-white lg:static lg:ml-auto lg:min-w-5 lg:px-1.5 lg:py-0.5 lg:text-xs">
					{badgeCount > 99 ? "99+" : badgeCount}
				</span>
			) : null}
		</Link>
	);
}

export function Sidebar() {
	const { data } = useAuthenticatedUser();

	return (
		<aside className="sticky top-0 flex h-screen w-18 shrink-0 flex-col justify-between px-1.5 py-4 lg:w-80 lg:p-4 border-r border-r-muted md:border-r-0">
			<div className="space-y-6">
				{/* Logo at Top */}
				<div className="py-2 text-center lg:px-3 lg:text-left">
					<Logo compactBelowLaptop />
				</div>

				{/* Navigation Links */}
				<nav className="space-y-1">
					<SidebarLink to="/home" icon={RiHome5Line} label={m.nav_home()} />
					<SidebarLink
						to="/search"
						icon={RiSearchLine}
						label={m.nav_search()}
					/>
					<SidebarLink
						to="/notifications"
						icon={RiNotification3Line}
						label={m.nav_notifications()}
						badgeCount={data?.user.unseenNotificationsCount}
					/>
					{/* Module de discussion temporairement désactivé.
					<SidebarLink
						to="/discussions"
						icon={RiChat3Line}
						label={m.nav_discussions()}
					/>
					*/}
					<SidebarLink
						to="/bookmark-collections"
						icon={RiBookmarkLine}
						label={m.nav_bookmarks()}
					/>
					<SidebarLink
						to="/settings"
						icon={RiSettings3Line}
						label={m.nav_settings()}
					/>
					{data ? (
						<SidebarLink
							to="/$username"
							params={{ username: `@${data.user.username}` }}
							icon={RiUserLine}
							label={m.nav_profile()}
						/>
					) : null}
				</nav>
			</div>
			<div>
				{/* User Profile / Logout Section at Bottom */}
				<div className="pb-3 lg:px-2">
					<div className="hidden lg:block">
						<Button
							size="lg"
							fullWidth
							type="button"
							title={m.action_post()}
							className="px-0 has-[>svg]:px-0 lg:px-6 lg:has-[>svg]:px-6"
							onClick={() => void NiceModal.show(CreatePostModal)}
						>
							<RiAddLine className="size-5 lg:hidden" aria-hidden="true" />
							<span className="sr-only lg:not-sr-only">{m.action_post()}</span>
						</Button>
					</div>
					<div className="flex items-center justify-center lg:hidden">
						<IconButton
							size="lg"
							type="button"
							title={m.action_post()}
							onClick={() => void NiceModal.show(CreatePostModal)}
						>
							<RiAddLine className="size-5" aria-hidden="true" />
						</IconButton>
					</div>
				</div>
				<div className="pt-4 lg:px-2">
					<AuthenticatedUserDropdown compactBelowLaptop />
				</div>
			</div>
		</aside>
	);
}
