import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/core/constants/navigation.constants";

export function BottomNav() {
	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around p-2 z-40">
			{NAV_ITEMS.map((item) => {
				const IconComponent = item.icon;
				return (
					<Link
						key={item.to}
						to={item.to}
						className="p-2.5 text-slate-500 hover:text-sky-500 transition-colors"
						activeProps={{
							className: "text-sky-500",
						}}
					>
						<IconComponent className="h-6 w-6" />
					</Link>
				);
			})}
		</nav>
	);
}
