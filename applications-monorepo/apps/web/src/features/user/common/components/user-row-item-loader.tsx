import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";

type UserRowItemLoaderProps = {
	className?: string;
};

function UserRowItemLoader({ className }: UserRowItemLoaderProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3 px-6 py-3",
				className,
			)}
			aria-hidden="true"
		>
			<div className="flex min-w-0 flex-1 items-center gap-2.5">
				<Skeleton className="size-10 shrink-0 rounded-full" />
				<div className="min-w-0 flex-1 space-y-1.5">
					<Skeleton className="h-4 w-24 rounded" />
					<Skeleton className="h-3 w-20 rounded" />
				</div>
			</div>
			<Skeleton className="h-8 w-16 shrink-0 rounded" />
		</div>
	);
}

export { UserRowItemLoader };
