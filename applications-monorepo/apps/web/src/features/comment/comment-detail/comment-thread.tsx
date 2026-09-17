import { useEffect } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import * as m from "@/paraglide/messages.js";
import { useComments } from "../comments/use-comments.ts";
import type { Comment } from "../common/comment.ts";
import { CommentItem } from "../common/comment-item.tsx";
import { CommentListLoader } from "../common/components/loaders/comment-list-loader.tsx";
import { CreateCommentForm } from "../create-comment/create-comment-form.tsx";

function CommentThread({
	comment,
	parentComments,
}: {
	comment: Comment;
	parentComments: Comment[];
}) {
	const repliesQuery = useComments({
		postId: comment.postId,
		parentCommentId: comment.id,
	});
	const { ref, isIntersecting } = useIntersectionObserver({
		rootMargin: "100px",
	});

	useEffect(() => {
		if (
			isIntersecting &&
			repliesQuery.hasNextPage &&
			!repliesQuery.isFetching &&
			!repliesQuery.isFetchNextPageError
		) {
			void repliesQuery.fetchNextPage();
		}
	}, [
		isIntersecting,
		repliesQuery.hasNextPage,
		repliesQuery.isFetching,
		repliesQuery.isFetchNextPageError,
		repliesQuery.fetchNextPage,
	]);

	const replies = repliesQuery.data?.pages.flatMap((page) => page.data) ?? [];

	return (
		<section
			aria-label={m.comment_replies_section_label()}
			className="overflow-hidden md:rounded-xl md:border"
		>
			{parentComments.map((parentComment) => (
				<CommentItem
					key={parentComment.id}
					comment={parentComment}
					isReply
					showReplies={false}
					showReplyAction={false}
					threadConnector
				/>
			))}

			<div className="border-y bg-muted/20 md:first:border-t-0">
				<CommentItem comment={comment} isReply showReplies={false} />
			</div>

			{!comment.isDeleted ? (
				<div className="border-b px-4 py-3">
					<CreateCommentForm postId={comment.postId} replyTo={comment} />
				</div>
			) : null}

			<div>
				{repliesQuery.isPending ? (
					<CommentListLoader count={3} />
				) : repliesQuery.isError && !repliesQuery.data ? (
					<ExceptionBlock
						bordered={false}
						title={m.comment_replies_load_error()}
						description={(repliesQuery.error as Error)?.message}
						onRefresh={() => void repliesQuery.refetch()}
						isRefetching={repliesQuery.isRefetching}
					/>
				) : replies.length === 0 ? (
					<EmptyBlock
						bordered={false}
						title={m.comment_replies_empty_title()}
						description={m.comment_replies_empty_description()}
					/>
				) : (
					replies.map((reply) => <CommentItem key={reply.id} comment={reply} />)
				)}

				{repliesQuery.hasNextPage ? (
					<div ref={ref} className="flex justify-center p-4">
						<Button
							variant="ghost"
							isLoading={repliesQuery.isFetchingNextPage}
							onClick={() => void repliesQuery.fetchNextPage()}
						>
							{repliesQuery.isFetchNextPageError
								? m.action_refresh()
								: m.comment_replies_more()}
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}

export { CommentThread };
