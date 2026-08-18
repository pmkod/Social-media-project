import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { PostDetail } from "@/features/post/post-detail/post-detail";

const postDetailSearchParams = z.object({
	focusComment: z.boolean().optional(),
});

export const Route = createFileRoute("/_main/posts/$postId")({
	validateSearch: postDetailSearchParams,
	component: PostDetailPage,
});

function PostDetailPage() {
	const { postId } = Route.useParams();
	const { focusComment } = Route.useSearch();
	return (
		<MainContainer>
			<PostDetail postId={postId} autoFocusComment={focusComment} />
		</MainContainer>
	);
}
