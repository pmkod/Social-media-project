import { RiChat3Line, RiHeartFill, RiHeartLine } from "@remixicon/react";
import { useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { cn } from "@/core/lib/utils.ts";
import { formatCommentCreationDate } from "@/features/post/common/post.utils.ts";
import { UserProfileHoverCard } from "@/features/user/profile/user-profile-hover-card.tsx";
import { CreateCommentForm } from "../create-comment/create-comment-form.tsx";
import { useCommentReplies } from "../get-comments/use-comment-replies.ts";
import { useLikeComment } from "../like-comment/use-like-comment.ts";
import { useUnlikeComment } from "../unlike-comment/use-unlike-comment.ts";
import type { Comment } from "./comment.ts";
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
	const repliesQuery = useCommentReplies(
		rootCommentId,
		!compact && !isReply && areRepliesExpanded,
	);

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
				"flex gap-3",
				compact
					? "px-2 py-2"
					: "px-4 py-4 border-b border-border last:border-b-0",
				isReply && "border-b-0 py-3 pr-0",
			)}
		>
			<UserProfileHoverCard
				username={comment.author?.handle}
				className="h-fit shrink-0 rounded-full"
			>
				<img
					src={
						comment.author?.avatar ||
						`https://ui-avatars.com/api/?name=${encodeURIComponent(
							comment.author?.name || "U",
						)}&background=random`
					}
					alt={comment.author?.name || "Auteur"}
					className={cn(
						"rounded-full object-cover shrink-0 ring-1 ring-border",
						isReply ? "size-8" : "size-10",
					)}
				/>
			</UserProfileHoverCard>
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-1.5 flex-wrap">
					<UserProfileHoverCard
						username={comment.author?.handle}
						className="flex min-w-0 items-baseline gap-1.5 hover:underline"
					>
						<span className="truncate text-sm font-semibold text-foreground">
							{comment.author?.name}
						</span>
						<span className="truncate text-xs text-muted-foreground">
							@{comment.author?.handle}
						</span>
					</UserProfileHoverCard>
					<span className="text-xs text-muted-foreground">·</span>
					<span className="text-xs text-muted-foreground">
						{formatCommentCreationDate(comment.createdAt)}
					</span>
				</div>

				<p className="mt-1 text-sm text-foreground whitespace-pre-line leading-relaxed">
					{comment.content}
				</p>

				<div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
					<button
						type="button"
						onClick={toggleLike}
						disabled={likeComment.isPending || unlikeComment.isPending}
						aria-label={isLiked ? "Retirer le like" : "Liker le commentaire"}
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
							<span>Répondre</span>
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
								? "Masquer les réponses"
								: `Voir ${repliesCount} réponse${repliesCount > 1 ? "s" : ""}`}
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
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => repliesQuery.fetchNextPage()}
								disabled={repliesQuery.isFetchingNextPage}
							>
								Voir plus de réponses
							</Button>
						) : null}
					</div>
				) : null}
			</div>
		</article>
	);
}
export type { CommentItemProps };
