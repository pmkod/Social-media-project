import { RiLogoutBoxLine, RiUserLine } from "@remixicon/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu.tsx";
import { useLogout } from "@/features/authentication/logout/use-logout.ts";
import { UserAvatar } from "../common/components/user-avatar.tsx";
import {
	authenticatedUserQueryKey,
	useAuthenticatedUser,
} from "./use-authenticated-user.ts";

function AuthenticatedUserDropdown() {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const logout = useLogout();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	if (!authenticatedUser) return null;

	const profileParams = { username: `@${authenticatedUser.username}` };

	const handleLogout = async () => {
		await logout.mutateAsync();
		queryClient.removeQueries({ queryKey: authenticatedUserQueryKey });
		await navigate({ to: "/" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="flex w-full min-w-0 items-center gap-3 rounded-2xl p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label="Ouvrir le menu du profil"
				>
					<UserAvatar user={authenticatedUser} size="default" />
					<div className="min-w-0 flex-1">
						<div className="truncate text-xs font-semibold text-foreground">
							{authenticatedUser.fullName}
						</div>
						<div className="truncate text-[11px] text-muted-foreground">
							@{authenticatedUser.username}
						</div>
					</div>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" side="top" className="mb-2">
				<DropdownMenuItem asChild>
					<Link to="/$username" params={profileParams}>
						<RiUserLine />
						Profile
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
					{logout.isPending ? "Déconnexion..." : "Se déconnecter"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { AuthenticatedUserDropdown };
