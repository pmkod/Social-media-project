import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import {
	CommentListLoader,
	CommentThread,
	useCommentDetail,
} from "@/features/comment";
import * as m from "@/paraglide/messages.js";

export const Route = createFileRoute(
	"/_main/_with-right-aside/posts_/$postId/comments/$commentId",
)({
	component: CommentDetailPage,
});

function CommentDetailPage() {
	const { postId, commentId } = Route.useParams();
	const query = useCommentDetail({ postId, commentId });

	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to={`/posts/${postId}`} />
					<AppHeaderTitle>{m.comment_detail_title()}</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>

			{query.isPending ? (
				<div className="overflow-hidden md:rounded-xl md:border">
					<CommentListLoader count={3} />
				</div>
			) : query.isSuccess ? (
				<CommentThread
					key={commentId}
					comment={query.data.comment}
					parentComments={query.data.parentComments}
				/>
			) : (
				<ExceptionBlock
					title={m.comment_detail_load_error()}
					description={(query.error as Error)?.message}
					onRefresh={() => void query.refetch()}
					isRefetching={query.isRefetching}
					className="h-120 border-0 md:border"
				/>
			)}
		</MainContainer>
	);
}
