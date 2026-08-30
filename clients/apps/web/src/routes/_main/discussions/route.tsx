import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { cn } from "@/core/lib/utils.ts";
import { DiscussionList } from "@/features/discussion/list/discussion-list.tsx";

export const Route = createFileRoute("/_main/discussions")({
	component: DiscussionsLayout,
});

function DiscussionsLayout() {
	const { discussionId } = useParams({ strict: false });

	return (
		<main className="h-screen flex min-w-0 flex-1 overflow-hidden border-border bg-background text-foreground md:h-dvh md:pr-4">
			<aside
				className={cn(
					"flex h-full w-full min-w-0 flex-col bg-background lg:w-88 lg:max-w-[38%] lg:shrink-0 lg:border-x",
					discussionId && "hidden lg:flex",
				)}
			>
				<DiscussionList selectedDiscussionId={discussionId} />
			</aside>

			<section
				className={cn(
					"min-w-0 flex-1",
					discussionId
						? "flex h-full flex-col bg-background"
						: "hidden items-center justify-center bg-muted/15 px-8 lg:flex",
				)}
			>
				<Outlet />
			</section>
		</main>
	);
}
