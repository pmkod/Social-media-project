import { useEffect } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { getExceptionMessage } from "@/core/exceptions/translate-exception-code.ts";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { cn } from "@/core/lib/utils.ts";
import {
	CommentItem,
	CommentListLoader,
	CreateCommentForm,
	useComments,
} from "@/features/comment";
import * as m from "@/paraglide/messages.js";

export function PostComments({
	postId,
	autoFocus = false,
	layout = "inline",
}: {
	postId: string;
	autoFocus?: boolean;
	layout?: "inline" | "panel";
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
			aria-label={m.comments_section_label()}
			className={cn(
				"overflow-hidden rounded-b-xl border-x border-b",
				layout === "panel" &&
					"flex min-h-0 flex-1 flex-col rounded-none border-0",
			)}
		>
			<div
				className={cn(
					"border-y px-4 py-3",
					layout === "panel" && "order-last shrink-0 border-b-0",
				)}
			>
				<CreateCommentForm postId={postId} autoFocus={autoFocus} />
			</div>
			<div
				className={cn(
					layout === "panel" &&
						"min-h-0 flex-1 overflow-y-auto overscroll-contain",
				)}
			>
				{query.isPending ? (
					<CommentListLoader count={3} />
				) : query.isError && !query.data ? (
					<ExceptionBlock
						bordered={false}
						title="Unable to load comments"
						description={getExceptionMessage(query.error)}
						onRefresh={() => void query.refetch()}
						isRefetching={query.isRefetching}
					/>
				) : comments.length === 0 ? (
					<EmptyBlock
						bordered={false}
						title={m.comments_empty_title()}
						description={m.comments_empty_description()}
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
								: m.comments_more()}
						</Button>
					</div>
				) : null}
			</div>
		</section>
	);
}
