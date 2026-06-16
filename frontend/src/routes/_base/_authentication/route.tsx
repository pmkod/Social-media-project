import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_base/_authentication")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col">
			<main className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-sm">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
