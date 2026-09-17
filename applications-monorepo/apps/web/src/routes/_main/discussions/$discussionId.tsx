import { createFileRoute } from "@tanstack/react-router";
import { DiscussionDetail } from "@/features/discussion/detail/discussion-detail.tsx";

export const Route = createFileRoute("/_main/discussions/$discussionId")({
	component: DiscussionDetailPage,
});

function DiscussionDetailPage() {
	const { discussionId } = Route.useParams();

	return <DiscussionDetail discussionId={discussionId} />;
}
