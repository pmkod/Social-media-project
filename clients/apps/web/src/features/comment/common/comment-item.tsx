import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import { useState } from "react";
import { cn } from "@/core/lib/utils.ts";
import { formatCommentCreationDate } from "@/features/post/common/post.utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";
import { useCommentToReplyTo } from "../comment-to-reply-to/use-comment-to-reply-to.ts";
import { useComments } from "../comments/use-comments.ts";
import { useLikeComment } from "../like-comment/use-like-comment.ts";
import { useUnlikeComment } from "../unlike-comment/use-unlike-comment.ts";
import type { Comment } from "./comment.ts";
import { CommentActionsDropdown } from "./comment-actions-dropdown.tsx";
import { CommentItemLoader } from "./components/loaders/comment-item-loader.tsx";

type CommentItemProps = {
	comment: Comment;
	isReply?: boolean;
};

export function CommentItem({ comment, isReply = false }: CommentItemProps) {
	const [areRepliesExpanded, setAreRepliesExpanded] = useState(false);
	const { commentToReplyTo, setCommentToReplyTo } = useCommentToReplyTo();
	const likeComment = useLikeComment();
	const unlikeComment = useUnlikeComment();
	// const rootCommentId = comment.parentId ?? comment.id;
	const repliesQuery = useComments({
		postId: comment.postId,
		parentCommentId: comment.id ?? undefined,
		enabled: isReply && areRepliesExpanded,
	});

	const fetchMoreReplies = () => {
		setAreRepliesExpanded(true);
		if (
			// !areRepliesExpanded ||
			// !repliesQuery.hasNextPage ||
			repliesQuery.isFetching
		)
			return;

		repliesQuery.fetchNextPage();
	};

	const isLiked = comment.isLikedByAuthenticatedUser ?? false;
	const replies = areRepliesExpanded
		? (repliesQuery.data?.pages.flatMap((page) => page.data) ?? [])
		: [];
	const repliesCount = comment.repliesCount ?? 0;
	const showedRepliesCount = replies.length;
	const repliesThatRemainToBeSeenCount = repliesCount - showedRepliesCount;
	const isSelectedForReply = commentToReplyTo?.id === comment.id;

	const toggleLike = () => {
		if (likeComment.isPending || unlikeComment.isPending) return;
		if (isLiked) unlikeComment.mutate(comment.id);
		else likeComment.mutate(comment.id);
	};

	const hideReplies = () => {
		setAreRepliesExpanded(false);
	};

	return (
		<div
			className={` ${isReply ? "" : "border-b border-border last:border-b-0"}`}
		>
			<article
				className={cn(
					"flex items-start gap-3 px-4 pt-4",
					// isReply && "border-b-0 py-3 pr-0",
				)}
			>
				<UserProfileHoverCard user={comment.author}>
					<UserProfileLink
						user={comment.author}
						onClick={(e) => e.stopPropagation()}
					>
						<UserAvatar user={comment.author} size={"md"} />
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
						<CommentActionsDropdown comment={comment} user={comment.author} />
					</div>

					<p className="mt-1 text-sm text-foreground whitespace-pre-line leading-relaxed">
						{comment.content}
					</p>

					<div className="-ml-1 flex items-center gap-2 text-muted-foreground text-xs">
						<button
							type="button"
							onClick={toggleLike}
							disabled={likeComment.isPending || unlikeComment.isPending}
							aria-label={isLiked ? "Unlike comment" : "Like comment"}
							className={cn(
								"flex items-center gap-1.5 transition-colors p-1.5 cursor-pointer rounded-full hover:bg-accent disabled:opacity-60",
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

						<button
							type="button"
							onClick={() => setCommentToReplyTo(comment)}
							aria-pressed={isSelectedForReply}
							className={cn(
								"flex items-center gap-1.5 p-1.5 rounded-full hover:bg-accent hover:text-foreground cursor-pointer transition-colors",
								isSelectedForReply && "text-foreground",
							)}
						>
							<span>Reply</span>
						</button>
					</div>
				</div>
			</article>
			<div className={`pb-2 ${!isReply ? "pl-17" : "pl-0"}`}>
				<div className={``}>
					{repliesQuery.isLoading && areRepliesExpanded ? (
						<div className="">
							<CommentItemLoader isReply contentLines={1} />
						</div>
					) : replies.length > 0 ? (
						<div className="mt-2">
							{replies.map((reply) => (
								<CommentItem key={reply.id} comment={reply} isReply />
							))}
							{areRepliesExpanded && repliesQuery.isFetchingNextPage ? (
								<div>
									<CommentItemLoader isReply contentLines={2} />
									<CommentItemLoader isReply contentLines={1} />
									<CommentItemLoader isReply contentLines={1} />
								</div>
							) : null}
						</div>
					) : null}
				</div>

				{repliesCount > 0 ? (
					<div className={`${isReply ? "pl-17" : "pl-0"}`}>
						{repliesThatRemainToBeSeenCount > 0 ? (
							<button
								type="button"
								onClick={fetchMoreReplies}
								className="text-xs font-semibold text-gray-900 cursor-pointer"
							>
								{`View ${repliesThatRemainToBeSeenCount} ${repliesThatRemainToBeSeenCount > 1 ? "replies" : "reply"}`}
							</button>
						) : (
							<button
								type="button"
								onClick={hideReplies}
								className="text-xs font-semibold text-gray-900 cursor-pointer"
							>
								Hide replies
							</button>
						)}
					</div>
				) : null}
			</div>
		</div>
	);
}
export type { CommentItemProps };
