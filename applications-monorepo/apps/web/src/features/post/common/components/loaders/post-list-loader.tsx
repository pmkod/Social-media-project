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
	const loaders = [];
	for (let index = 0; index < count; index += 1) {
		loaders.push(
			<PostItemLoader
				key={index}
				hasMedia={index === 0}
				contentLines={index === 0 ? 1 : (index % 2) + 1}
				roundedTopOnFirstItem={roundedTopOnFirstItem}
			/>,
		);
	}

	return (
		<div className={cn("md:divide-y md:divide-border", className)}>
			{loaders}
		</div>
	);
}

export { PostListLoader };
