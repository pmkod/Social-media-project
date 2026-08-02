import { IconLogout } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/core/components/partials/logo";
import { Button } from "@/core/components/ui/button.tsx";
import { NAV_ITEMS } from "@/core/constants/navigation.constants";

export function Sidebar() {
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
								className="flex items-center gap-3.5 px-4 py-1.5 rounded text-slate-700 hover:bg-gray-200 font-normal text-lg transition-colors"
								activeProps={{
									className: "bg-gray-200 text-sky-600 dark:text-sky-400",
								}}
							>
								<IconComponent className="siz-7 shrink-0" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* User Profile / Logout Section at Bottom */}
			<div className="px-2 pb-3">
				<Button className="w-full" type="button" onClick={() => {}}>
					Publier
				</Button>
			</div>
			<div className="border-t border-slate-200/80 dark:border-slate-800 pt-4 px-2">
				<div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
					<div className="flex items-center gap-3 min-w-0">
						<img
							src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
							alt="User Avatar"
							className="h-9 w-9 rounded-full object-cover shrink-0"
						/>
						<div className="min-w-0">
							<div className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">
								Mon Compte
							</div>
							<div className="text-[11px] text-slate-500 truncate">
								@mon_compte
							</div>
						</div>
					</div>
					<Link
						to="/"
						className="text-slate-400 hover:text-rose-500 p-1.5 rounded-full hover:bg-rose-500/10 transition-colors"
						title="Se déconnecter"
					>
						<IconLogout className="h-4 w-4" />
					</Link>
				</div>
			</div>
		</aside>
	);
}
