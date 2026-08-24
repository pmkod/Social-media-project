import { createFileRoute, Outlet } from "@tanstack/react-router";
import { FollowSuggestions } from "@/features/user/follow-suggestions/follow-suggestions.tsx";

export const Route = createFileRoute("/_main/_with-right-aside")({
	component: MainWithRightAsideLayout,
});

function MainWithRightAsideLayout() {
	return (
		<div className="flex flex-1 min-w-0 justify-between px-6">
			<main className="flex-1 min-w-0 border-border bg-background text-foreground min-h-screen">
				<Outlet />
			</main>

			<FollowSuggestions />
		</div>
	);
}
