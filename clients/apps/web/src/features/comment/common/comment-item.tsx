import { RiChat3Line, RiHeartFill, RiHeartLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { cn } from "@/core/lib/utils.ts";
import { formatCommentCreationDate } from "@/features/post/common/post.utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";
import { useCommentReplies } from "../comments/use-comment-replies.ts";
import { CreateCommentForm } from "../create-comment/create-comment-form.tsx";
import { useLikeComment } from "../like-comment/use-like-comment.ts";
import { useUnlikeComment } from "../unlike-comment/use-unlike-comment.ts";
import type { Comment } from "./comment.ts";
import { CommentActionsDropdown } from "./comment-actions-dropdown.tsx";
import { CommentItemLoader } from "./components/loaders/comment-item-loader.tsx";

type CommentItemProps = {
	comment: Comment;
	compact?: boolean;
	isReply?: boolean;
};

export function CommentItem({
	comment,
	compact = false,
	isReply = false,
}: CommentItemProps) {
	const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
	const [areRepliesExpanded, setAreRepliesExpanded] = useState(false);
	const likeComment = useLikeComment();
	const unlikeComment = useUnlikeComment();
	const rootCommentId = comment.parentId ?? comment.id;
	const repliesQuery = useCommentReplies({
		commentId: rootCommentId,
		enabled: !compact && !isReply && areRepliesExpanded,
	});
	const {
		ref: repliesObserverTargetRef,
		isIntersecting: isRepliesTargetIntersecting,
	} = useIntersectionObserver({ rootMargin: "100px" });

	useEffect(() => {
		if (
			!areRepliesExpanded ||
			!isRepliesTargetIntersecting ||
			!repliesQuery.hasNextPage ||
			repliesQuery.isFetching
		)
			return;

		repliesQuery.fetchNextPage();
	}, [
		areRepliesExpanded,
		isRepliesTargetIntersecting,
		repliesQuery.hasNextPage,
		repliesQuery.isFetching,
		repliesQuery.fetchNextPage,
	]);

	const isLiked = comment.isLikedByAuthenticatedUser ?? false;
	const replies = areRepliesExpanded
		? (repliesQuery.data?.pages.flatMap((page) => page.data) ?? [])
		: [];
	const repliesCount = comment.repliesCount ?? 0;

	const toggleLike = () => {
		if (likeComment.isPending || unlikeComment.isPending) return;
		if (isLiked) unlikeComment.mutate(comment.id);
		else likeComment.mutate(comment.id);
	};

	return (
		<article
			className={cn(
				"flex items-start gap-3",
				compact
					? "px-2 py-2"
					: "px-4 py-4 border-b border-border last:border-b-0",
				isReply && "border-b-0 py-3 pr-0",
			)}
		>
			<UserProfileHoverCard user={comment.author}>
				<UserProfileLink
					user={comment.author}
					onClick={(e) => e.stopPropagation()}
				>
					<UserAvatar user={comment.author} size={isReply ? "sm" : "md"} />
				</UserProfileLink>
			</UserProfileHoverCard>
			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-2">
					<div className="flex min-w-0 items-baseline gap-1.5 flex-wrap">
						<UserProfileHoverCard user={comment.author}>
							<UserProfileLink
								user={comment.author}
								onClick={(e) => e.stopPropagation()}
								className="flex min-w-0 items-baseline gap-1 cursor-pointer"
							>
								<span className="truncate text-sm font-semibold text-foreground">
									{comment.author.fullName}
								</span>
								<span className="truncate text-xs text-muted-foreground">
									@{comment.author.username}
								</span>
							</UserProfileLink>
						</UserProfileHoverCard>
						<span className="text-xs text-muted-foreground">·</span>
						<span className="text-xs text-muted-foreground">
							{formatCommentCreationDate(comment.createdAt)}
						</span>
					</div>
					<CommentActionsDropdown
						commentId={comment.id}
						user={comment.author}
					/>
				</div>

				<p className="mt-1 text-sm text-foreground whitespace-pre-line leading-relaxed">
					{comment.content}
				</p>

				<div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
					<button
						type="button"
						onClick={toggleLike}
						disabled={likeComment.isPending || unlikeComment.isPending}
						aria-label={isLiked ? "Unlike comment" : "Like comment"}
						className={cn(
							"flex items-center gap-1.5 transition-colors p-1.5 rounded-full hover:bg-accent disabled:opacity-60",
							isLiked ? "text-rose-500" : "hover:text-rose-500",
						)}
					>
						{isLiked ? (
							<RiHeartFill className="size-4 text-rose-500" />
						) : (
							<RiHeartLine className="size-4" />
						)}
						<span className="font-light">{comment.likesCount ?? 0}</span>
					</button>

					{!compact ? (
						<button
							type="button"
							onClick={() => setIsReplyFormOpen((open) => !open)}
							className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-accent hover:text-sky-500 transition-colors"
						>
							<RiChat3Line className="size-4" />
							<span>Reply</span>
						</button>
					) : null}
				</div>

				{isReplyFormOpen ? (
					<div className="mt-2 overflow-hidden rounded-xl border border-border">
						<CreateCommentForm
							postId={comment.postId}
							parentComment={comment}
							onSuccess={() => {
								setIsReplyFormOpen(false);
								setAreRepliesExpanded(true);
							}}
						/>
					</div>
				) : null}

				{!compact && !isReply && repliesCount > 0 ? (
					<div className="mt-2">
						<button
							type="button"
							onClick={() => setAreRepliesExpanded((expanded) => !expanded)}
							className="text-xs font-semibold text-sky-500 hover:text-sky-600"
						>
							{areRepliesExpanded
								? "Hide replies"
								: `View ${repliesCount} repl${repliesCount > 1 ? "ies" : "y"}`}
						</button>
					</div>
				) : null}

				{repliesQuery.isLoading && areRepliesExpanded ? (
					<div className="mt-2 border-l-2 border-border pl-2">
						<CommentItemLoader isReply contentLines={1} />
					</div>
				) : replies.length > 0 ? (
					<div className="mt-2 border-l-2 border-border pl-2">
						{replies.map((reply) => (
							<CommentItem key={reply.id} comment={reply} isReply />
						))}
						{areRepliesExpanded && repliesQuery.hasNextPage ? (
							<div ref={repliesObserverTargetRef}>
								<CommentItemLoader isReply contentLines={1} />
							</div>
						) : null}
					</div>
				) : null}
			</div>
		</article>
	);
}
export type { CommentItemProps };
