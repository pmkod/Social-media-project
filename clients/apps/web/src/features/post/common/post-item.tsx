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
import { Button } from "@/core/components/ui/button.tsx";
import { cn } from "@/core/lib/utils.ts";
import type { Post } from "./post.ts";

interface PostItemProps {
	post: Post;
	onBookmarkToggle?: (postId: string) => void;
}

function isVideoUrl(url: string): boolean {
	const lower = url.toLowerCase();
	return (
		lower.endsWith(".mp4") ||
		lower.endsWith(".webm") ||
		lower.endsWith(".ogg") ||
		lower.includes("video/") ||
		(lower.startsWith("blob:") && lower.includes("video"))
	);
}

function MediaElement({ src, className }: { src: string; className: string }) {
	if (isVideoUrl(src)) {
		return (
			<video
				src={src}
				controls
				className={className}
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}
	return <img src={src} alt="Post media" className={className} />;
}

function PostMediaGrid({ media }: { media: string[] }) {
	const count = media.length;
	const base =
		"mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 grid gap-1 bg-black/5 dark:bg-black/40";

	if (count === 1) {
		return (
			<div className={base}>
				<MediaElement
					src={media[0]}
					className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-200"
				/>
			</div>
		);
	}

	if (count === 2) {
		return (
			<div className={cn(base, "grid-cols-2 h-64")}>
				{media.map((src) => (
					<MediaElement
						key={src}
						src={src}
						className="h-full w-full object-cover hover:scale-[1.01] transition-transform duration-200"
					/>
				))}
			</div>
		);
	}

	return <PostMediaSlider media={media} />;
}

function PostMediaSlider({ media }: { media: string[] }) {
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
		<div className="mt-3 relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-black/5 dark:bg-black/40">
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
				{media.map((src) => (
					<div
						key={src}
						className="relative shrink-0 snap-start w-[calc(33.333%-0.25rem)] h-full"
					>
						<MediaElement
							src={src}
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

export function PostItem({ post, onBookmarkToggle }: PostItemProps) {
	const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
	const [likesCount, setLikesCount] = useState(post.stats.likes);
	const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked ?? false);
	const [isReposted, setIsReposted] = useState(false);
	const [repostsCount, setRepostsCount] = useState(post.stats.reposts);

	const handleLike = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isLiked) {
			setIsLiked(false);
			setLikesCount((prev) => prev - 1);
		} else {
			setIsLiked(true);
			setLikesCount((prev) => prev + 1);
		}
	};

	const handleBookmark = (e: React.MouseEvent) => {
		e.stopPropagation();
		const nextState = !isBookmarked;
		setIsBookmarked(nextState);
		if (onBookmarkToggle) {
			onBookmarkToggle(post.id);
		}
	};

	const mediaList =
		post.medias && post.medias.length > 0
			? post.medias.map((m) => m.lowQualityUrl || m.highQualityUrl)
			: post.mediaUrls && post.mediaUrls.length > 0
				? post.mediaUrls
				: post.images && post.images.length > 0
					? post.images
					: [];

	return (
		<article className="border-x border-t last:border-b first:rounded-t-xl last:rounded-b-xl border-slate-200/80 dark:border-slate-800 p-4 dark:hover:bg-slate-900/50 transition-colors">
			<div className="flex gap-3">
				{/* Avatar */}
				<img
					src={post.author.avatar}
					alt={post.author.name}
					className="size-12 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-800"
				/>

				{/* Content Container */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center justify-between gap-2">
						<Link
							to="/posts/$postId"
							params={{ postId: post.id }}
							className="flex items-center gap-1.5 min-w-0 flex-wrap hover:underline text-lg"
						>
							<span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-base">
								{post.author.name}
							</span>
							<span className="text-sm text-slate-500 truncate">
								@{post.author.handle}
							</span>
							<span className="text-sm text-slate-400">·</span>
							<span className="text-sm font-normal text-slate-500">
								{post.createdAt}
							</span>
						</Link>
						<button
							type="button"
							aria-label="Options"
							onClick={(e) => e.stopPropagation()}
							className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
						<p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
							{post.content}
						</p>
					</Link>

					{/* Media Grid */}
					{mediaList.length > 0 ? <PostMediaGrid media={mediaList} /> : null}

					{/* Action Buttons */}
					<div className="mt-1 flex items-center gap-x-4 text-slate-500 dark:text-slate-400 text-xs max-w-md">
						{/* Like */}
						<button
							type="button"
							onClick={handleLike}
							className={`flex items-center gap-1.5 transition-colors group -ml-2 p-2 rounded-full hover:bg-gray-100 ${
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
							className="flex items-center gap-1.5 transition-colors group -ml-2 p-2 rounded-full hover:bg-gray-100"
						>
							<RiChat3Line className="size-6" />
							<span className="text-base font-light">
								{post.stats.comments}
							</span>
						</Link>

						{/* Bookmark */}
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
										<RiBookmarkFill className="h-4 w-4 text-amber-500" />
									) : (
										<RiBookmarkLine className="h-4 w-4" />
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
