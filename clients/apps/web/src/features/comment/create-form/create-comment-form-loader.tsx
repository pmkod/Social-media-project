import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";

type CreateCommentFormLoaderProps = {
	className?: string;
};

function CreateCommentFormLoader({ className }: CreateCommentFormLoaderProps) {
	return (
		<div className={cn(className)}>
			<div className="flex gap-3">
				{/* User Avatar Skeleton */}
				<Skeleton className="size-10 shrink-0 rounded-full" />

				{/* Comment Input Skeleton */}
				<div className="min-w-0 flex-1">
					<Skeleton className="mt-2 h-6 w-52 rounded-lg" />
				</div>

				{/* Submit Button Skeleton */}
				<Skeleton className="h-9 w-28 rounded" />
			</div>

			{/* Keep the same vertical space as the form footer. */}
			<div className="mt-3 flex items-center justify-between pt-2" />
		</div>
	);
}

export { CreateCommentFormLoader };
