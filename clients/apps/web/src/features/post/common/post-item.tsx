import {
	IconBookmark,
	IconBookmarkFilled,
	IconChevronLeft,
	IconChevronRight,
	IconDots,
	IconHeart,
	IconHeartFilled,
	IconMessageCircle,
	IconPlus,
	IconRepeat,
	IconSend,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils.ts";
import type { Post } from "./post.ts";

interface PostItemProps {
	post: Post;
	onBookmarkToggle?: (postId: string) => void;
}

function PostImageGrid({ images }: { images: string[] }) {
	const count = images.length;
	const base =
		"mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 grid gap-1";
	const imgBase =
		"h-full w-full object-cover hover:scale-[1.01] transition-transform duration-200";

	if (count === 1) {
		return (
			<div className={base}>
				<img
					src={images[0]}
					alt="Post media"
					className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-200"
				/>
			</div>
		);
	}

	if (count === 2) {
		return (
			<div className={cn(base, "grid-cols-2 h-64")}>
				{images.map((src) => (
					<img key={src} src={src} alt="Post media" className={imgBase} />
				))}
			</div>
		);
	}

	return <PostImageSlider images={images} />;
}

function PostImageSlider({ images }: { images: string[] }) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(images.length > 3);

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

	const extraCount = images.length - 3;

	return (
		<div className="mt-3 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
			{extraCount > 0 ? (
				<div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-white">
					<IconPlus className="h-3 w-3" />
					<span>{extraCount}</span>
				</div>
			) : null}

			<div
				ref={trackRef}
				onScroll={updateScrollState}
				className="flex h-80 gap-1 overflow-x-auto snap-x snap-mandatory"
			>
				{images.map((src) => (
					<div
						key={src}
						className="relative shrink-0 snap-start w-[calc(33.333%-0.25rem)] h-full"
					>
						<img
							src={src}
							alt="Post media"
							className="h-full w-full object-cover rounded-lg"
						/>
					</div>
				))}
			</div>

			{canScrollLeft ? (
				<button
					type="button"
					onClick={() => scrollBy(-1)}
					className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
					aria-label="Image précédente"
				>
					<IconChevronLeft className="h-4 w-4" />
				</button>
			) : null}

			{canScrollRight ? (
				<button
					type="button"
					onClick={() => scrollBy(1)}
					className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
					aria-label="Image suivante"
				>
					<IconChevronRight className="h-4 w-4" />
				</button>
			) : null}
		</div>
	);
}

export function PostItem({ post, onBookmarkToggle }: PostItemProps) {
	const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
	const [likesCount, setLikesCount] = useState(post.stats.likes);
	const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
	const [isReposted, setIsReposted] = useState(false);
	const [repostsCount, setRepostsCount] = useState(post.stats.reposts);

	const handleLike = () => {
		if (isLiked) {
			setIsLiked(false);
			setLikesCount((prev) => prev - 1);
		} else {
			setIsLiked(true);
			setLikesCount((prev) => prev + 1);
		}
	};

	const handleBookmark = () => {
		const nextState = !isBookmarked;
		setIsBookmarked(nextState);
		if (onBookmarkToggle) {
			onBookmarkToggle(post.id);
		}
	};

	const handleRepost = () => {
		if (isReposted) {
			setIsReposted(false);
			setRepostsCount((prev) => prev - 1);
		} else {
			setIsReposted(true);
			setRepostsCount((prev) => prev + 1);
		}
	};

	return (
		<article className="border-b border-slate-200/80 dark:border-slate-800 p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
			<div className="flex gap-3">
				{/* Avatar */}
				<img
					src={post.author.avatar}
					alt={post.author.name}
					className="h-10 w-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
				/>

				{/* Content Container */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-1.5 min-w-0 flex-wrap">
							<span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
								{post.author.name}
							</span>
							<span className="text-xs text-slate-500 dark:text-slate-400 truncate">
								@{post.author.handle}
							</span>
							<span className="text-xs text-slate-400 dark:text-slate-500">
								·
							</span>
							<span className="text-xs text-slate-500 dark:text-slate-400">
								{post.createdAt}
							</span>
						</div>
						<button
							type="button"
							aria-label="Options"
							className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
						>
							<IconDots className="h-4 w-4" />
						</button>
					</div>

					{/* Post Content */}
					<p className="mt-2 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
						{post.content}
					</p>

					{/* Media Grid */}
					{post.images && post.images.length > 0 ? (
						<PostImageGrid images={post.images} />
					) : null}

					{/* Action Buttons */}
					<div className="mt-3 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs max-w-md">
						{/* Like */}
						<button
							type="button"
							onClick={handleLike}
							className={`flex items-center gap-1.5 transition-colors group ${
								isLiked ? "text-rose-500" : "hover:text-rose-500"
							}`}
						>
							<div className="p-1.5 rounded-full group-hover:bg-rose-500/10">
								{isLiked ? (
									<IconHeartFilled className="h-4 w-4 text-rose-500" />
								) : (
									<IconHeart className="h-4 w-4" />
								)}
							</div>
							<span>{likesCount}</span>
						</button>

						{/* Comment */}
						<button
							type="button"
							className="flex items-center gap-1.5 hover:text-sky-500 transition-colors group"
						>
							<div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
								<IconMessageCircle className="h-4 w-4" />
							</div>
							<span>{post.stats.comments}</span>
						</button>

						{/* Repost */}
						<button
							type="button"
							onClick={handleRepost}
							className={`flex items-center gap-1.5 transition-colors group ${
								isReposted ? "text-emerald-500" : "hover:text-emerald-500"
							}`}
						>
							<div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
								<IconRepeat className="h-4 w-4" />
							</div>
							<span>{repostsCount}</span>
						</button>

						{/* Share */}
						<button
							type="button"
							className="flex items-center gap-1.5 hover:text-sky-500 transition-colors group"
						>
							<div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
								<IconSend className="h-4 w-4" />
							</div>
							<span>{post.stats.shares ?? 0}</span>
						</button>

						{/* Bookmark (only when a toggle handler is provided) */}
						{onBookmarkToggle ? (
							<button
								type="button"
								onClick={handleBookmark}
								className={`flex items-center gap-1.5 transition-colors group ${
									isBookmarked ? "text-amber-500" : "hover:text-amber-500"
								}`}
							>
								<div className="p-1.5 rounded-full group-hover:bg-amber-500/10">
									{isBookmarked ? (
										<IconBookmarkFilled className="h-4 w-4 text-amber-500" />
									) : (
										<IconBookmark className="h-4 w-4" />
									)}
								</div>
							</button>
						) : null}
					</div>
				</div>
			</div>
		</article>
	);
}
