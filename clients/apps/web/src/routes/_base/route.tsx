import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "@/core/components/partials/footer";
import { Header } from "@/core/components/partials/header";

export const Route = createFileRoute("/_base")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<div className="min-h-170 flex items-center">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}
