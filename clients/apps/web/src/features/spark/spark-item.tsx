import {
	RiChat3Line,
	RiFlashlightFill,
	RiHeartFill,
	RiHeartLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/core/components/ui/dialog.tsx";
import { BookmarkButton } from "@/features/bookmark/common/bookmark-button.tsx";
import { PostComments } from "@/features/comment/post-comments.tsx";
import type { Post } from "@/features/post/common/post.ts";
import { formatPostCreationDate } from "@/features/post/common/post.utils.ts";
import { PostActionsDropdown } from "@/features/post/common/post-actions-dropdown.tsx";
import { useLikePost } from "@/features/post/like-post/use-like-post.ts";
import { buildVideoUrl } from "@/features/post/post-media.functions.ts";
import { useUnlikePost } from "@/features/post/unlike-post/use-unlike-post.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { SparkPlayer } from "./spark-player.tsx";

export function sparkVideoUrl(post: Post) {
	const media = post.medias?.find(
		(item) => item.mediaType?.toUpperCase() === "VIDEO",
	);
	const file = media?.highQualityFile ?? media?.lowQualityFile;
	return file ? buildVideoUrl(file.filename || file.url || "") : "";
}

export function SparkItem({
	post,
	onComment,
	paused = false,
}: {
	post: Post;
	onComment?: () => void;
	paused?: boolean;
}) {
	const [commentsOpen, setCommentsOpen] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const like = useLikePost();
	const unlike = useUnlikePost();
	const liked = post.isLikedByAuthenticatedUser ?? false;
	const caption = post.text || post.content || "";
	const videoUrl = sparkVideoUrl(post);
	return (
		<article className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
			<header className="flex items-center gap-3 px-4 py-3">
				{post.author ? (
					<UserProfileLink user={post.author}>
						<UserAvatar user={post.author} />
					</UserProfileLink>
				) : (
					<UserAvatar />
				)}
				<div className="min-w-0 flex-1">
					{post.author ? (
						<UserProfileLink
							user={post.author}
							className="block truncate text-sm font-semibold"
						>
							{post.author.fullName}
						</UserProfileLink>
					) : (
						<span className="text-sm">Unavailable account</span>
					)}
					<p className="text-xs text-muted-foreground">
						{formatPostCreationDate(post.createdAt)}
					</p>
				</div>
				<Link
					to="/sparks"
					className="flex items-center gap-1 text-xs font-semibold text-primary"
				>
					<RiFlashlightFill className="size-4" />
					Spark
				</Link>
				{post.author ? (
					<PostActionsDropdown user={post.author} post={post} size="sm" />
				) : null}
			</header>
			{videoUrl ? (
				<SparkPlayer
					key={videoUrl}
					src={videoUrl}
					paused={paused || commentsOpen}
				/>
			) : (
				<p className="bg-black p-12 text-center text-white">
					Video unavailable
				</p>
			)}
			<div className="px-4 pb-3 pt-2">
				<div className="flex items-center gap-4">
					<button
						type="button"
						aria-label={liked ? "Unlike Spark" : "Like Spark"}
						aria-pressed={liked}
						disabled={like.isPending || unlike.isPending}
						onClick={() =>
							(liked ? unlike : like).mutate(post.id, {
								onError: () =>
									toast.error("Unable to update your like. Please try again."),
							})
						}
						className="flex items-center gap-1.5 rounded-full py-2 disabled:opacity-50"
					>
						{liked ? (
							<RiHeartFill className="size-6 text-rose-500" />
						) : (
							<RiHeartLine className="size-6" />
						)}
						<span className="text-sm">{post.likesCount ?? 0}</span>
					</button>
					<button
						type="button"
						aria-label="Comment on Spark"
						onClick={() => (onComment ? onComment() : setCommentsOpen(true))}
						className="flex items-center gap-1.5 rounded-full py-2"
					>
						<RiChat3Line className="size-6" />
						<span className="text-sm">{post.commentsCount ?? 0}</span>
					</button>
					<div className="ml-auto">
						<BookmarkButton
							postId={post.id}
							isBookmarked={post.isBookmarkedByAuthenticatedUser ?? false}
						/>
					</div>
				</div>
				{caption ? (
					<p
						className={`whitespace-pre-wrap break-words text-sm ${expanded ? "" : "line-clamp-2"}`}
					>
						{caption}
					</p>
				) : null}
				{caption.length > 100 || caption.includes("\n") ? (
					<button
						type="button"
						aria-expanded={expanded}
						onClick={() => setExpanded(!expanded)}
						className="mt-1 text-xs text-muted-foreground"
					>
						{expanded ? "Less" : "More"}
					</button>
				) : null}
			</div>
			<Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Comments</DialogTitle>
						<DialogDescription>
							Join the conversation on this Spark.
						</DialogDescription>
					</DialogHeader>
					<DialogBody>
						{commentsOpen ? <PostComments postId={post.id} autoFocus /> : null}
					</DialogBody>
				</DialogContent>
			</Dialog>
		</article>
	);
}
