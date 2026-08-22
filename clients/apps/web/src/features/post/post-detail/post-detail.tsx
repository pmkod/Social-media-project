import { RiArrowLeftLine } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import {
	CommentItem,
	CommentListLoader,
	CreateCommentForm,
	useComments,
} from "@/features/comment";
import { PostItemLoader } from "../common/components/loaders/post-item-loader.tsx";
import { PostItem } from "../common/post-item.tsx";
import { usePost } from "./use-post";

type PostDetailProps = {
	postId: string;
	autoFocusComment?: boolean;
};

export function PostDetail({ postId, autoFocusComment }: PostDetailProps) {
	const { data: post, isLoading, isError } = usePost({ postId });
	const {
		data: commentsData,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isLoading: isCommentsLoading,
	} = useComments({ postId, enabled: Boolean(post) });
	const {
		ref: commentsObserverTargetRef,
		isIntersecting: isCommentsTargetIntersecting,
	} = useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (!isCommentsTargetIntersecting || !hasNextPage || isFetching) return;

		fetchNextPage();
	}, [isCommentsTargetIntersecting, hasNextPage, isFetching, fetchNextPage]);

	if (isLoading) {
		return <PostItemLoader hasMedia={true} />;
	}

	if (isError || !post) {
		return (
			<div className="p-8 text-center space-y-4">
				<p className="text-rose-500 text-sm">
					Post not found or failed to load.
				</p>
				<Link
					to="/home"
					className="inline-flex items-center gap-2 text-sky-500 hover:underline text-sm font-medium"
				>
					<RiArrowLeftLine className="h-4 w-4" />
					<span>Back to feed</span>
				</Link>
			</div>
		);
	}

	const allComments = commentsData?.pages.flatMap((page) => page.data) ?? [];

	return (
		<div>
			{/* Top Header */}
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<AppHeaderTitle>Post</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div>
				<PostItem post={post} />
				<div className="px-4 py-3 border-x border-y">
					{/* Add Comment Form */}
					<CreateCommentForm postId={post.id} autoFocus={autoFocusComment} />
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
		</div>
	);
}
