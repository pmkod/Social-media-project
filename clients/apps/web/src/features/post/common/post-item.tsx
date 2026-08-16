import {
	RiAddLine,
	RiArrowLeftSLine,
	RiArrowRightSLine,
	RiBookmarkFill,
	RiBookmarkLine,
	RiChat3Line,
	RiHeartFill,
	RiHeartLine,
	RiMoreLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useAddBookmark } from "@/features/bookmark/use-add-bookmark.ts";
import { useRemoveBookmark } from "@/features/bookmark/use-remove-bookmark.ts";
import { CommentModal } from "../create-comment/comment-modal.tsx";
import { useLikePost } from "../like-post/use-like-post.ts";
import { buildImageUrl, buildVideoUrl } from "../post-media.functions.ts";
import { useUnlikePost } from "../unlike-post/use-unlike-post.ts";
import { CommentItem } from "./comment-item.tsx";
import type { Post, PostMediaItem } from "./post.ts";
import { formatPostCreationDate } from "./post.utils.ts";

type PostItemProps = { post: Post };

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
	return <img src={item.url} alt="Média du post" className={className} />;
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
					aria-label="Média précédent"
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
					aria-label="Média suivant"
				>
					<RiArrowRightSLine className="h-4 w-4" />
				</button>
			) : null}
		</div>
	);
}

export function PostItem({ post }: PostItemProps) {
	const isLiked = post.isLikedByAuthenticatedUser ?? false;
	const likesCount = post.likesCount ?? 0;
	const isBookmarked = post.isBookmarkedByAuthenticatedUser ?? false;
	const likePost = useLikePost();
	const unlikePost = useUnlikePost();
	const addBookmark = useAddBookmark();
	const removeBookmark = useRemoveBookmark();

	const handleLike = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isLiked) {
			unlikePost.mutate(post.id);
		} else {
			likePost.mutate(post.id);
		}
	};

	const handleBookmark = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (addBookmark.isPending || removeBookmark.isPending) return;
		if (isBookmarked) removeBookmark.mutate(post.id);
		else addBookmark.mutate({ postId: post.id });
	};

	const handleOpenCommentModal = (e: React.MouseEvent) => {
		e.stopPropagation();
		NiceModal.show(CommentModal, { postId: post.id });
	};

	const mediaList: RenderMediaItem[] = (post.medias ?? [])
		.map((m) => getMediaUrl(m))
		.filter((item): item is RenderMediaItem => item !== null);

	const commentsCount = post.commentsCount ?? 0;

	return (
		<article className="border-x border-t last:border-b first:rounded-t-xl last:rounded-b-xl border-border p-4 hover:bg-muted/30 transition-colors">
			<div className="flex gap-3">
				{/* Avatar */}
				<Link
					to="/$username"
					params={{ username: `@${post.author?.handle ?? ""}` }}
					className="h-fit shrink-0 rounded-full"
					onClick={(event) => event.stopPropagation()}
				>
					<img
						src={
							post.author?.avatar ||
							`https://ui-avatars.com/api/?name=${encodeURIComponent(
								post.author?.name || "U",
							)}&background=random`
						}
						alt={post.author?.name || "Auteur"}
						className="size-12 rounded-full object-cover ring-1 ring-border"
					/>
				</Link>

				{/* Content Container */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center justify-between gap-2">
						<Link
							to="/posts/$postId"
							params={{ postId: post.id }}
							className="flex items-center gap-1.5 min-w-0 flex-wrap hover:underline text-lg"
						>
							<span className="font-semibold text-foreground truncate text-base">
								{post.author?.name}
							</span>
							<span className="text-sm text-muted-foreground truncate">
								@{post.author?.handle}
							</span>
							<span className="text-sm text-muted-foreground">·</span>
							<span className="text-sm font-normal text-muted-foreground">
								{formatPostCreationDate(post.createdAt)}
							</span>
						</Link>
						<button
							type="button"
							aria-label="Options"
							onClick={(e) => e.stopPropagation()}
							className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent transition-colors"
						>
							<RiMoreLine className="h-4 w-4" />
						</button>
					</div>

					{/* Post Content */}
					<Link
						to="/posts/$postId"
						params={{ postId: post.id }}
						className="block mt-0.5"
					>
						<p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
							{post.text || post.content}
						</p>
					</Link>

					{/* Media Grid */}
					{mediaList.length > 0 ? <PostMediaGrid media={mediaList} /> : null}

					{/* Action Buttons */}
					<div className="mt-1 flex items-center gap-x-4 text-muted-foreground text-xs max-w-md">
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
						<button
							type="button"
							onClick={handleOpenCommentModal}
							className="flex items-center gap-1.5 transition-colors group -ml-2 p-2 rounded-full hover:bg-accent hover:text-sky-500"
						>
							<RiChat3Line className="size-6" />
							<span className="text-base font-light">{commentsCount}</span>
						</button>

						{/* Bookmark */}
						<button
							type="button"
							onClick={handleBookmark}
							disabled={addBookmark.isPending || removeBookmark.isPending}
							aria-label={
								isBookmarked ? "Retirer des bookmarks" : "Ajouter aux bookmarks"
							}
							className={`flex items-center gap-1.5 transition-colors group disabled:opacity-60 ${
								isBookmarked ? "text-amber-500" : "hover:text-amber-500"
							}`}
						>
							<div className="p-1.5 rounded-full group-hover:bg-amber-500/10">
								{isBookmarked ? (
									<RiBookmarkFill className="h-4 w-4 text-amber-500" />
								) : (
									<RiBookmarkLine className="h-4 w-4" />
								)}
							</div>
						</button>
					</div>

					{/* Recent Comments */}
					{(post.comments ?? []).length > 0 ? (
						<div className="mt-2 -ml-1 border-l-2 border-border pl-3 space-y-1">
							{(post.comments ?? []).map((comment) => (
								<CommentItem key={comment.id} comment={comment} compact />
							))}
						</div>
					) : null}
				</div>
			</div>
		</article>
	);
}
