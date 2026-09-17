import { Skeleton } from "@/core/components/ui/skeleton.tsx";

function ReportReasonItemLoader() {
	return (
		<div className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-b-0">
			<div className="min-w-0 flex-1 space-y-2">
				<Skeleton className="h-4 w-2/5 rounded" />
				<Skeleton className="h-3.5 w-4/5 rounded" />
			</div>
			<Skeleton className="size-5 shrink-0 rounded-full" />
		</div>
	);
}

export { ReportReasonItemLoader };
