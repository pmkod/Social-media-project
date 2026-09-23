import { RiLogoutBoxLine, RiSettings3Line, RiUserLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useLogout } from "@/features/authentication/logout/use-logout.ts";
import { m } from "@/paraglide/messages.js";
import { UserAvatar } from "../common/components/user-avatar.tsx";
import {
	authenticatedUserQueryKey,
	useAuthenticatedUser,
} from "./use-authenticated-user.ts";

function AuthenticatedUserDropdown({
	compactBelowLaptop = false,
}: {
	compactBelowLaptop?: boolean;
}) {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const logout = useLogout();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	if (!authenticatedUser) return null;

	const profileParams = { username: `@${authenticatedUser.username}` };

	const handleLogout = async () => {
		try {
			await logout.mutateAsync();
		} catch {
			// The local session is still cleared when the backend is unavailable.
		} finally {
			queryClient.removeQueries({ queryKey: authenticatedUserQueryKey });
			await navigate({ to: "/" });
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className={cn(
						"flex w-full min-w-0 items-center gap-3 rounded p-3 cursor-pointer text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
						compactBelowLaptop &&
							"justify-center gap-0 lg:justify-start lg:gap-3",
					)}
					aria-label={m.profile_menu_open()}
				>
					<UserAvatar user={authenticatedUser} size="default" />
					<div
						className={cn(
							"min-w-0 flex-1",
							compactBelowLaptop && "hidden lg:block",
						)}
					>
						<div className="truncate text-sm font-semibold text-foreground">
							{authenticatedUser.fullName}
						</div>
						<div className="truncate text-xs text-muted-foreground">
							@{authenticatedUser.username}
						</div>
					</div>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" side="top" className="mb-2">
				<DropdownMenuItem asChild>
					<Link to="/$username" params={profileParams}>
						<RiUserLine />
						{m.nav_profile()}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link to="/settings">
						<RiSettings3Line />
						{m.nav_settings()}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					disabled={logout.isPending}
					onSelect={() => {
						void handleLogout();
					}}
				>
					<RiLogoutBoxLine />
					{logout.isPending ? m.profile_logging_out() : m.profile_logout()}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { AuthenticatedUserDropdown };
