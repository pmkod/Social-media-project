import { RiChat3Line, RiHeartFill, RiHeartLine } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
import { BookmarkButton } from "@/features/bookmark/common/bookmark-button.tsx";
import type { Post } from "@/features/post/common/post.ts";
import { formatPostCreationDate } from "@/features/post/common/post.utils.ts";
import { PostActionsDropdown } from "@/features/post/common/post-actions-dropdown.tsx";
import { useLikePost } from "@/features/post/like-post/use-like-post.ts";
import { buildVideoUrl } from "@/features/post/post-media.functions.ts";
import { useUnlikePost } from "@/features/post/unlike-post/use-unlike-post.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";
import { ChillzPlayer } from "./chillz-player.tsx";

export function chillzVideoUrl(post: Post) {
	const media = post.medias?.find(
		(item) => item.mediaType?.toUpperCase() === "VIDEO",
	);
	const file = media?.highQualityFile ?? media?.lowQualityFile;
	return file ? buildVideoUrl(file.filename || file.url || "") : "";
}

export function ChillzItem({
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
	const videoUrl = chillzVideoUrl(post);
	return (
		<div className="flex items-end justify-center mx-auto h-full">
			<div className="max-w-72 flex-1 h-max mr-5">
				<header className="flex items-start gap-3 py-3">
					{post.author ? (
						<UserProfileHoverCard user={post.author}>
							<UserProfileLink user={post.author}>
								<UserAvatar user={post.author} />
							</UserProfileLink>
						</UserProfileHoverCard>
					) : (
						<UserAvatar />
					)}
					<div className="min-w-0 flex-1">
						{post.author ? (
							<UserProfileHoverCard user={post.author}>
								<UserProfileLink
									user={post.author}
									className="block truncate text-sm font-semibold"
								>
									{post.author.fullName}
								</UserProfileLink>
							</UserProfileHoverCard>
						) : (
							<span className="text-sm">Unavailable account</span>
						)}
						<p className="text-xs text-muted-foreground">
							{formatPostCreationDate(post.createdAt)}
						</p>
					</div>
				</header>
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
			<div className="h-full aspect-9/16 overflow-hidden rounded-xl">
				{videoUrl ? (
					<ChillzPlayer
						key={videoUrl}
						src={videoUrl}
						paused={paused || commentsOpen}
					/>
				) : (
					<p className="bg-black p-12 text-center text-white">
						Video unavailable
					</p>
				)}
			</div>

			<div className="h-max w-max flex flex-col items-center gap-5 p-3 ml-4">
				<button
					type="button"
					aria-label={liked ? "Unlike Chillz" : "Like Chillz"}
					aria-pressed={liked}
					disabled={like.isPending || unlike.isPending}
					onClick={() =>
						(liked ? unlike : like).mutate(post.id, {
							onError: () =>
								toast.error("Unable to update your like. Please try again."),
						})
					}
					className={`group cursor-pointer leading-none flex flex-col items-center gap-0.5 disabled:opacity-50 ${
						liked ? "text-rose-500" : "hover:text-rose-500"
					}`}
				>
					<span className="rounded-full p-2 transition-colors group-hover:bg-accent">
						{liked ? (
							<RiHeartFill className="size-7 text-rose-500" />
						) : (
							<RiHeartLine className="size-7" />
						)}
					</span>
					<span className="text-base font-light leading-none">
						{post.likesCount ?? 0}
					</span>
				</button>
				<button
					type="button"
					aria-label="Comment on Chillz"
					onClick={() => (onComment ? onComment() : setCommentsOpen(true))}
					className="group cursor-pointer flex flex-col items-center gap-0.5"
				>
					<span className="rounded-full p-2 transition-colors group-hover:bg-accent group-hover:text-sky-500">
						<RiChat3Line className="size-6" />
					</span>
					<span className="text-base font-light leading-none">
						{post.commentsCount ?? 0}
					</span>
				</button>
				<div className="w-max">
					<BookmarkButton
						postId={post.id}
						isBookmarked={post.isBookmarkedByAuthenticatedUser ?? false}
					/>
				</div>

				{post.author ? (
					<PostActionsDropdown user={post.author} post={post} size="lg" />
				) : null}
			</div>
		</div>
	);
}
