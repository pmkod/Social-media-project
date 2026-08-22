import { cn } from "@/core/lib/utils.ts";
import { PostItemLoader } from "./post-item-loader.tsx";

type PostListLoaderProps = {
	count?: number;
	className?: string;
	roundedTopOnFirstItem?: boolean;
};

function PostListLoader({
	count = 5,
	className,
	roundedTopOnFirstItem = true,
}: PostListLoaderProps) {
	return (
		<div className={cn("divide-y divide-border", className)}>
			{Array.from({ length: count }).map((_, index) => (
				<PostItemLoader
					// biome-ignore lint/suspicious/noArrayIndexKey: Static array for skeleton loading placeholders
					key={index}
					hasMedia={index === 0}
					contentLines={index === 0 ? 1 : (index % 2) + 1}
					roundedTopOnFirstItem={roundedTopOnFirstItem}
				/>
			))}
		</div>
	);
}

export { PostListLoader };
