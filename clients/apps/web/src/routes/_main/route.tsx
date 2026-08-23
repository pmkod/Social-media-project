import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/core/components/partials/bottom-nav";
import { Sidebar } from "@/core/components/partials/sidebar";

export const Route = createFileRoute("/_main")({
	component: MainLayoutComponent,
});

function MainLayoutComponent() {
	return (
		<>
			<div className="min-h-screen w-full flex justify-between">
				<Sidebar />
				<Outlet />
			</div>

			<BottomNav />
		</>
	);
}
