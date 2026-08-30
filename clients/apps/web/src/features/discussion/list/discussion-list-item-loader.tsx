import { Skeleton } from "@/core/components/ui/skeleton.tsx";

const loaderIds = [
	"discussion-loader-1",
	"discussion-loader-2",
	"discussion-loader-3",
	"discussion-loader-4",
	"discussion-loader-5",
	"discussion-loader-6",
];

function DiscussionListItemLoader({ count = 6 }: { count?: number }) {
	return (
		<div role="status" aria-label="Loading discussions">
			{loaderIds.slice(0, count).map((loaderId) => (
				<div
					key={loaderId}
					className="flex items-center gap-3 border-b border-border/70 px-4 py-3.5"
				>
					<Skeleton className="size-12 shrink-0 rounded-full" />
					<div className="min-w-0 flex-1 space-y-2">
						<div className="flex justify-between gap-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-10" />
						</div>
						<Skeleton className="h-3 w-4/5" />
					</div>
				</div>
			))}
		</div>
	);
}

export { DiscussionListItemLoader };
