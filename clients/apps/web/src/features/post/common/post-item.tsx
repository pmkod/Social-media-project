import {
	RiAddLine,
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiBookmarkFill,
	RiBookmarkLine,
	RiChat3Line,
	RiHeartFill,
	RiHeartLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils.ts";
import { useAddBookmark } from "@/features/bookmark/use-add-bookmark.ts";
import { useRemoveBookmark } from "@/features/bookmark/use-remove-bookmark.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileLink } from "@/features/user/common/user-profile-link.tsx";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";
import { useLikePost } from "../like-post/use-like-post.ts";
import { buildImageUrl, buildVideoUrl } from "../post-media.functions.ts";
import { useUnlikePost } from "../unlike-post/use-unlike-post.ts";
import type { Post, PostMediaItem } from "./post.ts";
import { formatPostCreationDate } from "./post.utils.ts";
import { PostActionsDropdown } from "./post-actions-dropdown.tsx";

type PostItemProps = {
	post: Post;
	roundedTopOnFirstItem?: boolean;
};

export type RenderMediaItem = {
	url: string;
	isVideo: boolean;
};

export function isVideoMedia(m: PostMediaItem): boolean {
	if (m.mediaType?.toUpperCase() === "VIDEO") return true;
	const file = m.lowQualityFile || m.highQualityFile;
	const filename = file?.filename || file?.url;
	if (!filename) return false;
	const lower = filename.toLowerCase();
	return (
		lower.endsWith(".mp4") ||
		lower.endsWith(".webm") ||
		lower.endsWith(".ogg") ||
		lower.includes("video/") ||
		(lower.startsWith("blob:") && lower.includes("video"))
	);
}

export function getMediaUrl(m: PostMediaItem): RenderMediaItem | null {
	const file = m.lowQualityFile || m.highQualityFile;
	const filename = file?.filename || file?.url;
	if (!filename) return null;
	const isVideo = isVideoMedia(m);
	const url = isVideo ? buildVideoUrl(filename) : buildImageUrl(filename);
	return url ? { url, isVideo } : null;
}

export function MediaElement({
	item,
	className,
}: {
	item: RenderMediaItem;
	className: string;
}) {
	if (item.isVideo) {
		return (
			/* biome-ignore lint/a11y/useMediaCaption: Media preview player */
			<video
				src={item.url}
				controls
				className={className}
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}
	return <img src={item.url} alt="Post media" className={className} />;
}

export function PostMediaGrid({ media }: { media: RenderMediaItem[] }) {
	const count = media.length;
	const base =
		"mt-3 overflow-hidden rounded-2xl border border-border grid gap-1 bg-muted/40";

	if (count === 1) {
		return (
			<div className={base}>
				<MediaElement
					item={media[0]}
					className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-200"
				/>
			</div>
		);
	}

	if (count === 2) {
		return (
			<div className={cn(base, "grid-cols-2 h-64")}>
				{media.map((item) => (
					<MediaElement
						key={item.url}
						item={item}
						className="h-full w-full object-cover hover:scale-[1.01] transition-transform duration-200"
					/>
				))}
			</div>
		);
	}

	return <PostMediaSlider media={media} />;
}

function PostMediaSlider({ media }: { media: RenderMediaItem[] }) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(media.length > 3);

	const updateScrollState = useCallback(() => {
		const track = trackRef.current;
		if (!track) return;
		setCanScrollLeft(track.scrollLeft > 0);
		setCanScrollRight(
			track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
		);
	}, []);

	useEffect(() => {
		updateScrollState();
	}, [updateScrollState]);

	const scrollBy = (direction: 1 | -1) => {
		const track = trackRef.current;
		if (!track) return;
		const slideWidth = track.clientWidth / 3;
		track.scrollBy({ left: direction * slideWidth, behavior: "smooth" });
	};

	const extraCount = media.length - 3;

	return (
		<div className="mt-3 relative overflow-hidden rounded-2xl border border-border bg-muted/40">
			{extraCount > 0 ? (
				<div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
					<RiAddLine className="h-3 w-3" />
					<span>{extraCount}</span>
				</div>
			) : null}

			<div
				ref={trackRef}
				onScroll={updateScrollState}
				className="flex h-80 gap-1 overflow-x-auto snap-x snap-mandatory"
			>
				{media.map((item) => (
					<div
						key={item.url}
						className="relative shrink-0 snap-start w-[calc(33.333%-0.25rem)] h-full"
					>
						<MediaElement
							item={item}
							className="h-full w-full object-cover rounded-lg"
						/>
					</div>
				))}
			</div>

			{canScrollLeft ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						scrollBy(-1);
					}}
					className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
					aria-label="Previous media"
				>
					<RiArrowLeftSLine className="h-4 w-4" />
				</button>
			) : null}

			{canScrollRight ? (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						scrollBy(1);
					}}
					className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
					aria-label="Next media"
				>
					<RiArrowRightSLine className="h-4 w-4" />
				</button>
			) : null}
		</div>
	);
}

export function PostItem({
	post,
	roundedTopOnFirstItem = true,
}: PostItemProps) {
	const isLiked = post.isLikedByAuthenticatedUser ?? false;
	const likesCount = post.likesCount ?? 0;
	const isBookmarked = post.isBookmarkedByAuthenticatedUser ?? false;
	const likePost = useLikePost();
	const unlikePost = useUnlikePost();
	const addBookmark = useAddBookmark();
	const removeBookmark = useRemoveBookmark();
	const handleLike = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isLiked) {
			unlikePost.mutate(post.id);
		} else {
			likePost.mutate(post.id);
		}
	};

	const handleBookmark = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (addBookmark.isPending || removeBookmark.isPending) return;
		if (isBookmarked) removeBookmark.mutate(post.id);
		else addBookmark.mutate({ postId: post.id });
	};

	const mediaList: RenderMediaItem[] = (post.medias ?? [])
		.map((m) => getMediaUrl(m))
		.filter((item): item is RenderMediaItem => item !== null);

	const commentsCount = post.commentsCount ?? 0;

	return (
		<Link
			to="/posts/$postId"
			params={{ postId: post.id }}
			// search={{ focusComment: true }}
			// onClick={(e) => e.stopPropagation()}
			className={cn(
				"block border-x border-t last:border-b last:rounded-b-xl border-border p-4 hover:bg-muted/30 transition-colors cursor-pointer",
				roundedTopOnFirstItem ? "first:rounded-t-xl" : "",
			)}
		>
			<div className="flex items-start gap-3">
				{/* Avatar */}
				<UserProfileHoverCard user={post.author}>
					<UserProfileLink
						user={post.author}
						onClick={(e) => e.stopPropagation()}
					>
						<UserAvatar user={post.author} size="lg" />
					</UserProfileLink>
				</UserProfileHoverCard>

				{/* Content Container */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center justify-between gap-2">
						<div className="flex min-w-0 flex-wrap items-center gap-1.5 text-lg">
							<UserProfileHoverCard user={post.author}>
								<UserProfileLink
									user={post.author}
									onClick={(e) => e.stopPropagation()}
									className="flex min-w-0 items-center gap-1.5 cursor-pointer"
								>
									<span className="truncate text-base font-semibold text-foreground">
										{post.author.fullName}
									</span>
									<span className="truncate text-sm text-muted-foreground">
										@{post.author?.username}
									</span>
								</UserProfileLink>
							</UserProfileHoverCard>
							<span className="text-sm text-muted-foreground">·</span>
							<span className="text-sm font-normal text-muted-foreground hover:underline">
								{formatPostCreationDate(post.createdAt)}
							</span>
						</div>
						<PostActionsDropdown
							user={{
								id: post.author?.id,
								username: post.author?.username ?? "user",
								isBlockedByAuthenticatedUser:
									post.author?.isBlockedByAuthenticatedUser,
							}}
							postId={post.id}
							size="sm"
						/>
					</div>

					{/* Post Content */}
					<div className="mt-0.5">
						<p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
							{post.text || post.content}
						</p>
					</div>

					{/* Media Grid */}
					{mediaList.length > 0 ? <PostMediaGrid media={mediaList} /> : null}

					{/* Action Buttons */}
					<div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
						<div className="flex items-center gap-x-4">
							{/* Like */}
							<button
								type="button"
								onClick={handleLike}
								className={`flex items-center gap-1.5 transition-colors group -ml-2 p-2 rounded-full hover:bg-accent ${
									isLiked ? "text-rose-500" : "hover:text-rose-500"
								}`}
							>
								{isLiked ? (
									<RiHeartFill className="size-6 text-rose-500" />
								) : (
									<RiHeartLine className="size-6" />
								)}
								<span className="text-base font-light">{likesCount}</span>
							</button>

							{/* Comment */}
							<Link
								to="/posts/$postId"
								params={{ postId: post.id }}
								search={{ focusComment: true }}
								onClick={(e) => e.stopPropagation()}
								className="flex items-center gap-1.5 transition-colors group -ml-2 p-2 rounded-full hover:bg-accent hover:text-sky-500"
								aria-label="Comment on post"
							>
								<RiChat3Line className="size-6" />
								<span className="text-base font-light">{commentsCount}</span>
							</Link>
						</div>

						{/* Bookmark */}
						<button
							type="button"
							onClick={handleBookmark}
							disabled={addBookmark.isPending || removeBookmark.isPending}
							aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
							className={`flex items-center gap-1.5 transition-colors group -mr-2 p-2 rounded-full hover:bg-accent disabled:opacity-60 ${
								isBookmarked ? "text-amber-500" : "hover:text-amber-500"
							}`}
						>
							{isBookmarked ? (
								<RiBookmarkFill className="size-6 text-amber-500" />
							) : (
								<RiBookmarkLine className="size-6" />
							)}
						</button>
					</div>
				</div>
			</div>
		</Link>
	);
}
