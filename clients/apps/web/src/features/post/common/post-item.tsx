import {
	IconBookmark,
	IconBookmarkFilled,
	IconDots,
	IconHeart,
	IconHeartFilled,
	IconMessageCircle,
	IconRepeat,
	IconShare,
} from "@tabler/icons-react";
import { useState } from "react";

export interface Post {
	id: string;
	author: {
		name: string;
		handle: string;
		avatar: string;
	};
	createdAt: string;
	content: string;
	image?: string;
	stats: {
		comments: number;
		reposts: number;
		likes: number;
	};
	isLiked?: boolean;
	isBookmarked?: boolean;
}

interface PostItemProps {
	post: Post;
	onBookmarkToggle?: (postId: string) => void;
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

					{/* Optional Media */}
					{post.image ? (
						<div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
							<img
								src={post.image}
								alt="Post media"
								className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-200"
							/>
						</div>
					) : null}

					{/* Action Buttons */}
					<div className="mt-3 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs max-w-md">
						{/* Comments */}
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

						{/* Bookmark */}
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

						{/* Share */}
						<button
							type="button"
							className="flex items-center gap-1.5 hover:text-sky-500 transition-colors group"
						>
							<div className="p-1.5 rounded-full group-hover:bg-sky-500/10">
								<IconShare className="h-4 w-4" />
							</div>
						</button>
					</div>
				</div>
			</div>
		</article>
	);
}
