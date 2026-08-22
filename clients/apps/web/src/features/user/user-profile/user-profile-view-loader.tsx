import { Skeleton } from "@/core/components/ui/skeleton.tsx";

function UserProfileViewLoader() {
	return (
		<section
			className="overflow-hidden rounded-t-xl border-x border-t"
			aria-busy="true"
			aria-label="Loading profile"
		>
			<div className="h-48 sm:h-56">
				<Skeleton className="size-full rounded-none" />
			</div>

			<div className="px-8 pb-3">
				<div className="flex items-start justify-between">
					<div className="-mt-20 shrink-0 rounded-full border-4 border-background">
						<Skeleton className="size-32 rounded-full sm:size-36" />
					</div>

					<div className="flex items-center gap-2 pt-3">
						<Skeleton className="size-9 rounded-md" />
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
				</div>

				<div className="mt-3 space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-24" />
				</div>

				<div className="mt-4 space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
				</div>

				<Skeleton className="h-4 w-28 mt-4" />

				<div className="mt-4 flex flex-wrap gap-5">
					<Skeleton className="h-5 w-16" />
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-5 w-24" />
				</div>
			</div>
		</section>
	);
}

export { UserProfileViewLoader };
