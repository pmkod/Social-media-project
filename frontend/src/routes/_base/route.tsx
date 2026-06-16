import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/core/components/partials/header";
import { Footer } from "@/core/components/partials/footer";

export const Route = createFileRoute("/_base")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<div className="flex-1">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}
