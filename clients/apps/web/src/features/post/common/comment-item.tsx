import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import { useState } from "react";
import { cn } from "@/core/lib/utils.ts";
import type { Comment } from "./comment.ts";

interface CommentItemProps {
	comment: Comment;
	compact?: boolean;
}

export function CommentItem({ comment, compact = false }: CommentItemProps) {
	const [isLiked, setIsLiked] = useState(false);

	const likesCount = (comment.likesCount ?? 0) + (isLiked ? 1 : 0);

	return (
		<article
			className={cn(
				"flex gap-3",
				compact ? "px-2 py-2" : "px-4 py-4 border-b border-border",
			)}
		>
			<img
				src={comment.author.avatar}
				alt={comment.author.name}
				className="size-10 rounded-full object-cover shrink-0 ring-1 ring-border"
			/>
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-1.5 flex-wrap">
					<span className="font-semibold text-foreground text-sm">
						{comment.author.name}
					</span>
					<span className="text-xs text-muted-foreground">
						@{comment.author.handle}
					</span>
					<span className="text-xs text-muted-foreground">·</span>
					<span className="text-xs text-muted-foreground">
						{comment.createdAt}
					</span>
				</div>

				<p className="mt-1 text-sm text-foreground whitespace-pre-line leading-relaxed">
					{comment.content}
				</p>

				<div className="mt-2 flex items-center gap-4 text-muted-foreground text-xs">
					<button
						type="button"
						onClick={() => setIsLiked((prev) => !prev)}
						className={cn(
							"flex items-center gap-1.5 transition-colors group p-1 rounded-full hover:bg-accent",
							isLiked ? "text-rose-500" : "hover:text-rose-500",
						)}
					>
						{isLiked ? (
							<RiHeartFill className="size-4 text-rose-500" />
						) : (
							<RiHeartLine className="size-4" />
						)}
						<span className="font-light">{likesCount}</span>
					</button>
				</div>
			</div>
		</article>
	);
}
