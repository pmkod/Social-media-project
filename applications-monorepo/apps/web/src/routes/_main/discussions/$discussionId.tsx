import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/discussions/$discussionId")({
	beforeLoad: () => {
		throw redirect({ to: "/home" });
	},
});

// Implémentation précédente conservée en commentaire pour une réactivation ultérieure.
// import { createFileRoute } from "@tanstack/react-router";
// import { DiscussionDetail } from "@/features/discussion/detail/discussion-detail.tsx";
//
// export const Route = createFileRoute("/_main/discussions/$discussionId")({
// 	component: DiscussionDetailPage,
// });
//
// function DiscussionDetailPage() {
// 	const { discussionId } = Route.useParams();
//
// 	return <DiscussionDetail discussionId={discussionId} />;
// }
