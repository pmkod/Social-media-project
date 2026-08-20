import { RiLogoutBoxLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/core/components/partials/logo";
import { Button } from "@/core/components/ui/button.tsx";
import { NAV_ITEMS } from "@/core/constants/navigation.constants";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";

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
					{NAV_ITEMS.map((item) => {
						const IconComponent = item.icon;
						return (
							<Link
								key={item.to}
								to={item.to}
								className="flex items-center gap-4 px-4 py-2 rounded-md text-muted-foreground hover:bg-accent font-normal transition-colors"
								activeProps={{
									className: "text-primary font-medium",
								}}
							>
								<IconComponent className="size-6.5 shrink-0" />
								<span className="text-lg">{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>
			<div>
				{/* User Profile / Logout Section at Bottom */}
				<div className="px-2 pb-3">
					<Button size="lg" fullWidth type="button" onClick={() => {}}>
						Post
					</Button>
				</div>
				<div className="border-t border-border pt-4 px-2">
					<div className="flex items-center justify-between p-2 rounded-2xl hover:bg-accent transition-colors">
						<div className="flex items-center gap-3 min-w-0">
							{user ? (
								<Link
									to="/$username"
									params={{ username: `@${user.username}` }}
									className="flex min-w-0 items-center gap-3"
								>
									<UserAvatar user={user} size="default" className="shrink-0" />
									<div className="min-w-0">
										<div className="text-xs font-semibold truncate text-foreground">
											{user.fullName}
										</div>
										<div className="text-[11px] text-muted-foreground truncate">
											@{user.username}
										</div>
									</div>
								</Link>
							) : (
								<div className="flex min-w-0 items-center gap-3">
									<UserAvatar size="default" className="shrink-0" />
									<div className="min-w-0">
										<div className="text-xs font-semibold truncate text-foreground">
											Your profile
										</div>
										<div className="text-[11px] text-muted-foreground truncate">
											Log in
										</div>
									</div>
								</div>
							)}
						</div>
						<Link
							to="/"
							className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors"
							title="Log out"
						>
							<RiLogoutBoxLine className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</div>
		</aside>
	);
}
