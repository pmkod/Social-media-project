import { createFileRoute } from "@tanstack/react-router";
import { PostDetail } from "@/features/post/post-detail/post-detail";

export const Route = createFileRoute("/_main/posts/$postId")({
	component: PostDetailPage,
});

function PostDetailPage() {
	const { postId } = Route.useParams();
	return <PostDetail postId={postId} />;
}
