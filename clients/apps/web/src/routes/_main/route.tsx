import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/core/components/partials/bottom-nav";
import { Sidebar } from "@/core/components/partials/sidebar";
import { FollowSuggestions } from "@/features/user/follow-suggestions/follow-suggestions.tsx";

export const Route = createFileRoute("/_main")({
	component: MainLayoutComponent,
});

function MainLayoutComponent() {
	return (
		<div className="">
			<div className="min-h-screen w-full flex justify-between">
				{/* Desktop & Tablet Sidebar */}
				<Sidebar />

				{/* Mobile Header */}
				{/* <header className="md:hidden flex items-center justify-between p-3 px-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
					<Logo />
					<Link
						to="/"
						className="text-slate-500 hover:text-rose-500 p-2 rounded-full"
						title="Log out"
					>
						<RiLogoutBoxLine className="h-5 w-5" />
					</Link>
				</header> */}

				{/* Main Content Area */}
				<main className="flex-1 min-w-0 border-border bg-background text-foreground min-h-screen">
					<Outlet />
				</main>

				{/* Right Sidebar (Desktop Recommendations / Widgets) */}
				<FollowSuggestions />
			</div>

			{/* Mobile Navigation Bar */}
			<BottomNav />
		</div>
	);
}
