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
				<Sidebar />

				{/* Main Content Area */}
				<main className="flex-1 min-w-0 border-border bg-background text-foreground min-h-screen">
					<Outlet />
				</main>

				<FollowSuggestions />
			</div>

			<BottomNav />
		</div>
	);
}
