import { RiLogoutBoxLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/core/components/partials/logo";
import { Button } from "@/core/components/ui/button.tsx";
import { NAV_ITEMS } from "@/core/constants/navigation.constants";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export function Sidebar() {
	const { data: user } = useAuthenticatedUser();

	const avatar =
		user?.avatarUrl ||
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";

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
								className="flex items-center gap-3.5 px-4 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground font-normal text-lg transition-colors"
								activeProps={{
									className: "bg-accent text-accent-foreground font-medium",
								}}
							>
								<IconComponent className="size-7 shrink-0" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>
			<div>
				{/* User Profile / Logout Section at Bottom */}
				<div className="px-2 pb-3">
					<Button size="lg" fullWidth type="button" onClick={() => {}}>
						Publier
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
									<img
										src={avatar}
										alt={`Profil de ${user.fullName}`}
										className="h-9 w-9 rounded-full object-cover shrink-0"
									/>
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
									<img
										src={avatar}
										alt="Avatar par défaut"
										className="h-9 w-9 rounded-full object-cover shrink-0"
									/>
									<div className="min-w-0">
										<div className="text-xs font-semibold truncate text-foreground">
											Votre profil
										</div>
										<div className="text-[11px] text-muted-foreground truncate">
											Connectez-vous
										</div>
									</div>
								</div>
							)}
						</div>
						<Link
							to="/"
							className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors"
							title="Se déconnecter"
						>
							<RiLogoutBoxLine className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</div>
		</aside>
	);
}
