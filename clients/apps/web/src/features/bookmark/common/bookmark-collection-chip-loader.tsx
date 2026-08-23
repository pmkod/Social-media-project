import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";

type BookmarkCollectionChipLoaderProps = {
	className?: string;
};

function BookmarkCollectionChipLoader({
	className,
}: BookmarkCollectionChipLoaderProps) {
	return (
		<Skeleton
			aria-hidden="true"
			className={cn("h-9 w-28 shrink-0 rounded-full", className)}
		/>
	);
}

export { BookmarkCollectionChipLoader };
export type { BookmarkCollectionChipLoaderProps };
