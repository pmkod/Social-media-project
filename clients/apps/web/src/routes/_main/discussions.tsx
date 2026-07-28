import { createFileRoute } from "@tanstack/react-router";
import { DiscussionList } from "@/features/discussion/discussion-list";

export const Route = createFileRoute("/_main/discussions")({
	component: DiscussionsPage,
});

function DiscussionsPage() {
	return <DiscussionList />;
}
