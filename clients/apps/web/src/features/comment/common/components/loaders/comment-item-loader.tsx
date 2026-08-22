import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";

type CommentItemLoaderProps = {
	className?: string;
	compact?: boolean;
	isReply?: boolean;
	contentLines?: number;
};

function CommentItemLoader({
	className,
	compact = false,
	isReply = false,
	contentLines = 1,
}: CommentItemLoaderProps) {
	return (
		<article
			className={cn(
				"flex gap-3",
				compact
					? "px-2 py-2"
					: "px-4 py-4 border-b border-border last:border-b-0",
				isReply && "border-b-0 py-3 pr-0",
				className,
			)}
		>
			{/* Avatar Skeleton */}
			<Skeleton
				className={cn("rounded-full shrink-0", isReply ? "size-8" : "size-10")}
			/>

			{/* Content Container */}
			<div className="flex-1 min-w-0">
				{/* Header */}
				<div className="flex items-center gap-1.5 flex-wrap">
					{/* Author Name */}
					<Skeleton className="h-4 w-24 rounded" />
					{/* Handle */}
					<Skeleton className="h-3.5 w-16 rounded" />
					{/* Dot separator placeholder */}
					<span className="text-xs text-muted-foreground/40">·</span>
					{/* Date */}
					<Skeleton className="h-3.5 w-10 rounded" />
				</div>

				{/* Comment Text Content (no image) */}
				<div className="mt-2 space-y-1.5">
					<Skeleton className="h-4 w-5/6 rounded" />
					{contentLines > 1 && <Skeleton className="h-4 w-4/6 rounded" />}
					{contentLines > 2 && <Skeleton className="h-4 w-2/4 rounded" />}
				</div>

				{/* Action Buttons Skeleton */}
				<div className="mt-2.5 flex items-center gap-4 text-muted-foreground">
					{/* Like Button */}
					<div className="flex items-center gap-1.5">
						<Skeleton className="size-4 rounded-full" />
						<Skeleton className="h-3 w-4 rounded" />
					</div>

					{/* Reply Button */}
					{!compact && <Skeleton className="h-4 w-14 rounded" />}
				</div>
			</div>
		</article>
	);
}

export { CommentItemLoader };
export type { CommentItemLoaderProps };
