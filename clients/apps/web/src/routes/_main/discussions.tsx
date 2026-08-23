import { createFileRoute } from "@tanstack/react-router";
import { DiscussionList } from "@/features/discussion/discussion-list";

export const Route = createFileRoute("/_main/discussions")({
	component: DiscussionsPage,
});

function DiscussionsPage() {
	return (
		<main className="flex-1 min-w-0 border-border bg-background text-foreground min-h-screen">
			<DiscussionList />
		</main>
	);
}
