import { cn } from "@/core/lib/utils.ts";
import { CommentItemLoader } from "./comment-item-loader.tsx";

type CommentListLoaderProps = {
	count?: number;
	className?: string;
	compact?: boolean;
};

function CommentListLoader({
	count = 3,
	className,
	compact = false,
}: CommentListLoaderProps) {
	return (
		<div className={cn("divide-y divide-border", className)}>
			{Array.from({ length: count }).map((_, index) => (
				<CommentItemLoader
					// biome-ignore lint/suspicious/noArrayIndexKey: Static array for skeleton loading placeholders
					key={index}
					compact={compact}
					contentLines={(index % 2) + 1}
				/>
			))}
		</div>
	);
}

export { CommentListLoader };
export type { CommentListLoaderProps };
