import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Footer } from "@/core/components/partials/footer";
import { Header } from "@/core/components/partials/header";

export const Route = createFileRoute("/_base")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col">
			<Header />
			<div className="min-h-150 lg:min-h-180">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}
