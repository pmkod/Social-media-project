import {
	RiArrowLeftLine,
	RiBookmarkFill,
	RiBookmarkLine,
	RiChat3Line,
	RiHeartFill,
	RiHeartLine,
	RiLoader4Line,
	RiRepeatLine,
	RiSendPlane2Line,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { Textarea } from "@/core/components/ui/textarea.tsx";
import {
	getMediaUrl,
	type RenderMediaItem,
} from "../common/post-item.tsx";
import { useGetPostById } from "./use-get-post-by-id";

type PostDetailProps = {
	postId: string;
};

export function PostDetail({ postId }: PostDetailProps) {
	const { data: post, isLoading, isError } = useGetPostById(postId);
	const [commentText, setCommentText] = useState("");

	const [isLiked, setIsLiked] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isReposted, setIsReposted] = useState(false);

	if (isLoading) {
		return (
			<div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
				<RiLoader4Line className="h-8 w-8 animate-spin text-sky-500" />
				<span className="text-sm font-medium">
					Chargement de la publication...
				</span>
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="p-8 text-center space-y-4">
				<p className="text-rose-500 text-sm">
					Publication introuvable ou erreur de chargement.
				</p>
				<Link
					to="/home"
					className="inline-flex items-center gap-2 text-sky-500 hover:underline text-sm font-medium"
				>
					<RiArrowLeftLine className="h-4 w-4" />
					<span>Retour au flux</span>
				</Link>
			</div>
		);
	}

	const mediaList: RenderMediaItem[] = (post.medias ?? [])
		.map((m) => getMediaUrl(m))
		.filter((item): item is RenderMediaItem => item !== null);

	const likesCount = (post.stats.likes ?? 0) + (isLiked ? 1 : 0);
	const repostsCount = (post.stats.reposts ?? 0) + (isReposted ? 1 : 0);

	return (
		<div className="min-h-screen border-r border-l border-border">
			{/* Top Header */}
			<div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 p-4 border-b border-border flex items-center gap-4">
				<Link
					to="/home"
					className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
					aria-label="Retour"
				>
					<RiArrowLeftLine className="h-5 w-5" />
				</Link>
				<h1 className="text-lg font-bold text-foreground">
					Publication
				</h1>
			</div>

			{/* Main Post Details */}
			<article className="p-4 border-b border-border space-y-4">
				{/* Author Meta */}
				<div className="flex items-center gap-3">
					<img
						src={post.author.avatar}
						alt={post.author.name}
						className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
					/>
					<div>
						<h2 className="font-semibold text-foreground text-base">
							{post.author.name}
						</h2>
						<p className="text-xs text-muted-foreground">
							@{post.author.handle}
						</p>
					</div>
				</div>

				{/* Content */}
				<p className="text-base text-foreground whitespace-pre-line leading-relaxed">
					{post.content}
				</p>

				{/* Media Gallery */}
				{mediaList.length > 0 ? (
					<div className="space-y-2 mt-4">
						{mediaList.map((item) => (
							<div
								key={item.url}
								className="overflow-hidden rounded-2xl border border-border bg-muted/40"
							>
								{item.isVideo ? (
									<video
										src={item.url}
										controls
										className="w-full max-h-[500px] object-contain mx-auto"
									/>
								) : (
									<img
										src={item.url}
										alt="Média du post"
										className="w-full max-h-[500px] object-cover mx-auto"
									/>
								)}
							</div>
						))}
					</div>
				) : null}

				{/* Date & Time */}
				<div className="pt-2 text-xs text-muted-foreground border-t border-border">
					<span>Publié {post.createdAt}</span>
				</div>

				{/* Stats Row */}
				<div className="py-3 border-t border-b border-border flex items-center justify-around text-muted-foreground text-sm">
					{/* Likes */}
					<button
						type="button"
						onClick={() => setIsLiked((prev) => !prev)}
						className={`flex items-center gap-2 transition-colors ${
							isLiked ? "text-rose-500" : "hover:text-rose-500"
						}`}
					>
						{isLiked ? (
							<RiHeartFill className="h-5 w-5 text-rose-500" />
						) : (
							<RiHeartLine className="h-5 w-5" />
						)}
						<span>{likesCount}</span>
					</button>

					{/* Comments count */}
					<div className="flex items-center gap-2">
						<RiChat3Line className="h-5 w-5" />
						<span>{post.stats.comments}</span>
					</div>

					{/* Repost */}
					<button
						type="button"
						onClick={() => setIsReposted((prev) => !prev)}
						className={`flex items-center gap-2 transition-colors ${
							isReposted ? "text-emerald-500" : "hover:text-emerald-500"
						}`}
					>
						<RiRepeatLine className="h-5 w-5" />
						<span>{repostsCount}</span>
					</button>

					{/* Bookmark */}
					<button
						type="button"
						onClick={() => setIsBookmarked((prev) => !prev)}
						className={`flex items-center gap-2 transition-colors ${
							isBookmarked ? "text-amber-500" : "hover:text-amber-500"
						}`}
					>
						{isBookmarked ? (
							<RiBookmarkFill className="h-5 w-5 text-amber-500" />
						) : (
							<RiBookmarkLine className="h-5 w-5" />
						)}
					</button>
				</div>
			</article>

			{/* Add Comment Section */}
			<div className="p-4 border-b border-border">
				<h3 className="text-sm font-semibold text-foreground mb-3">
					Laisser un commentaire
				</h3>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (!commentText.trim()) return;
						setCommentText("");
					}}
					className="space-y-3"
				>
					<Textarea
						value={commentText}
						onChange={(e) => setCommentText(e.target.value)}
						placeholder="Poster votre réponse..."
						rows={2}
						className="resize-none text-sm"
					/>
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={!commentText.trim()}
							className="rounded-full px-4"
							size="sm"
						>
							<RiSendPlane2Line className="h-3.5 w-3.5" />
							<span>Répondre</span>
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
