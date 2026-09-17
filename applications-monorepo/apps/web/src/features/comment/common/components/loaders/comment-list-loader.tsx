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
	const loaders = [];
	for (let index = 0; index < count; index += 1) {
		loaders.push(
			<CommentItemLoader
				key={index}
				compact={compact}
				contentLines={(index % 2) + 1}
			/>,
		);
	}

	return (
		<div className={cn("divide-y divide-border", className)}>{loaders}</div>
	);
}

export { CommentListLoader };
