import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/core/constants/navigation.constants";

export function BottomNav() {
	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/90 backdrop-blur-md flex justify-around p-2 z-40">
			{NAV_ITEMS.map((item) => {
				const IconComponent = item.icon;
				return (
					<Link
						key={item.to}
						to={item.to}
						className="p-2.5 text-muted-foreground hover:text-sky-500 transition-colors"
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
