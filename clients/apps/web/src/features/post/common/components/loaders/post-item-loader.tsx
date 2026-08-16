import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";

type PostItemLoaderProps = {
	className?: string;
	hasMedia?: boolean;
	contentLines?: number;
};

function PostItemLoader({
	className,
	hasMedia = false,
	contentLines = 1,
}: PostItemLoaderProps) {
	return (
		<article
			className={cn(
				"border-x border-t last:border-b first:rounded-t-xl last:rounded-b-xl border-border p-4",
				className,
			)}
		>
			<div className="flex gap-3">
				{/* Avatar Skeleton */}
				<Skeleton className="size-12 rounded-full shrink-0" />

				{/* Content Container */}
				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-2 flex-wrap">
						{/* Author Name */}
						<Skeleton className="h-4 w-24 rounded" />
						{/* Handle */}
						<Skeleton className="h-3.5 w-10 rounded" />
					</div>

					{/* Post Text Content */}
					<div className="mt-4 space-y-1.5">
						<Skeleton className="h-4 w-4/5 rounded" />
						{contentLines > 1 && <Skeleton className="h-4 w-3/5 rounded" />}
						{contentLines > 2 && <Skeleton className="h-4 w-2/5 rounded" />}
					</div>

					{/* Media Grid Skeleton */}
					{hasMedia && (
						<div className="mt-3 overflow-hidden rounded-2xl border border-border bg-muted/40">
							<Skeleton className="h-80 w-full rounded-none" />
						</div>
					)}

					{/* Action Buttons Skeleton */}
					<div className="mt-3 mb-4 flex items-center gap-x-8 text-muted-foreground">
						<Skeleton className="size-5 rounded-full" />
						<Skeleton className="size-5 rounded-full" />
						<Skeleton className="size-5 rounded-full" />
					</div>
				</div>
			</div>
		</article>
	);
}

export { PostItemLoader };
