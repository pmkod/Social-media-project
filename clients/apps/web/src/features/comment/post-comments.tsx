import { useEffect } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import {
	CommentItem,
	CommentListLoader,
	CreateCommentForm,
	useComments,
} from "@/features/comment";

export function PostComments({
	postId,
	autoFocus = false,
}: {
	postId: string;
	autoFocus?: boolean;
}) {
	const query = useComments({ postId });
	const { ref, isIntersecting } = useIntersectionObserver({
		rootMargin: "100px",
	});
	useEffect(() => {
		if (
			isIntersecting &&
			query.hasNextPage &&
			!query.isFetching &&
			!query.isFetchNextPageError
		)
			void query.fetchNextPage();
	}, [
		isIntersecting,
		query.hasNextPage,
		query.isFetching,
		query.isFetchNextPageError,
		query.fetchNextPage,
	]);
	const comments = query.data?.pages.flatMap((page) => page.data) ?? [];
	return (
		<section
			aria-label="Comments"
			className="overflow-hidden rounded-b-xl border-x border-b"
		>
			<div className="border-y px-4 py-3">
				<CreateCommentForm postId={postId} autoFocus={autoFocus} />
			</div>
			{query.isPending ? (
				<CommentListLoader count={3} />
			) : query.isError && !query.data ? (
				<ExceptionBlock
					bordered={false}
					title="Unable to load comments"
					description="Please try again."
					onRefresh={() => void query.refetch()}
					isRefetching={query.isRefetching}
				/>
			) : comments.length === 0 ? (
				<EmptyBlock
					bordered={false}
					title="No comments yet"
					description="Be the first to share your thoughts."
				/>
			) : (
				comments.map((comment) => (
					<CommentItem key={comment.id} comment={comment} />
				))
			)}
			{query.hasNextPage ? (
				<div ref={ref} className="flex justify-center p-4">
					<Button
						variant="ghost"
						isLoading={query.isFetchingNextPage}
						onClick={() => void query.fetchNextPage()}
					>
						{query.isFetchNextPageError
							? "Retry loading comments"
							: "More comments"}
					</Button>
				</div>
			) : null}
		</section>
	);
}
