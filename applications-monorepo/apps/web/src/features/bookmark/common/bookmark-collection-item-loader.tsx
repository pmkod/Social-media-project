import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";

type BookmarkCollectionItemLoaderProps = {
	className?: string;
};

function BookmarkCollectionItemLoader({
	className,
}: BookmarkCollectionItemLoaderProps) {
	return (
		<Skeleton
			aria-hidden="true"
			className={cn("min-h-28 rounded-lg", className)}
		/>
	);
}

export { BookmarkCollectionItemLoader };
