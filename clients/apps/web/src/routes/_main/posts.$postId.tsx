import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import {
	CommentItem,
	CommentListLoader,
	CreateCommentForm,
	CreateCommentFormLoader,
	useComments,
} from "@/features/comment";
import { PostItemLoader } from "@/features/post/common/components/loaders/post-item-loader.tsx";
import { PostItem } from "@/features/post/common/post-item.tsx";
import { usePost } from "@/features/post/post-detail/use-post";

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
	const {
		data: post,
		isLoading,
		isSuccess,
		isError,
		refetch,
		isRefetching,
	} = usePost({ postId });
	const {
		data: commentsData,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isLoading: isCommentsLoading,
	} = useComments({ postId, enabled: post !== undefined });
	const {
		ref: commentsObserverTargetRef,
		isIntersecting: isCommentsTargetIntersecting,
	} = useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (!isCommentsTargetIntersecting || !hasNextPage || isFetching) return;

		fetchNextPage();
	}, [isCommentsTargetIntersecting, hasNextPage, isFetching, fetchNextPage]);

	const allComments = commentsData?.pages.flatMap((page) => page.data) ?? [];

	return (
		<MainContainer>
			{/* Top Header */}
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<AppHeaderTitle>Post</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div>
				{isLoading ? (
					<div>
						<PostItemLoader hasMedia={true} />
						<div className="px-4 py-3 border-x border-y">
							<CreateCommentFormLoader />
						</div>
						<div className="border-x border-b rounded-b-xl overflow-hidden">
							<CommentListLoader count={3} />
						</div>
					</div>
				) : isSuccess ? (
					<>
						<div>
							<PostItem post={post} />
							<div className="px-4 py-3 border-x border-y">
								{/* Add Comment Form */}
								<CreateCommentForm postId={post.id} autoFocus={focusComment} />
							</div>
						</div>

						{/* Comments Section */}
						<section className="border-x border-b rounded-b-xl overflow-hidden">
							{isCommentsLoading ? (
								<CommentListLoader count={3} />
							) : allComments.length === 0 ? (
								<EmptyBlock
									borderless
									title="No comments yet"
									description="Be the first to share your thoughts on this post."
								/>
							) : (
								<div>
									{allComments.map((comment) => (
										<CommentItem key={comment.id} comment={comment} />
									))}

									{hasNextPage ? (
										<div ref={commentsObserverTargetRef} className="p-4">
											<CommentListLoader count={2} />
										</div>
									) : null}
								</div>
							)}
						</section>
					</>
				) : isError ? (
					<ExceptionBlock
						title="Unable to load post"
						description="The post could not be found or failed to load."
						onRefresh={() => void refetch()}
						isRefetching={isRefetching}
					/>
				) : null}
			</div>
		</MainContainer>
	);
}
