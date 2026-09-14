import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav } from "@/core/components/partials/bottom-nav";
import { Sidebar } from "@/core/components/partials/sidebar";
import { FullPageLoader } from "@/core/components/ui/full-page-loader.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export const Route = createFileRoute("/_main")({
	component: MainLayoutComponent,
});

function MainLayoutComponent() {
	const authenticatedUserQuery = useAuthenticatedUser();
	const navigate = useNavigate();

	useEffect(() => {
		if (authenticatedUserQuery.isError) {
			navigate({
				to: "/",
			});
		}
	}, [authenticatedUserQuery.isError]);

	if (authenticatedUserQuery.isPending || authenticatedUserQuery.isError)
		return <FullPageLoader />;

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
