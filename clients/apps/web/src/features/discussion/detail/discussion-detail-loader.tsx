import { RiArrowLeftLine } from "@remixicon/react";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { MessageListLoader } from "./discussion-body.tsx";

function DiscussionDetailLoader() {
	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex h-[4.75rem] shrink-0 items-center gap-3 border-b border-border px-3 sm:px-4">
				<div className="inline-flex size-9 items-center justify-center lg:hidden">
					<RiArrowLeftLine className="size-5 text-muted-foreground" />
				</div>
				<Skeleton className="size-11 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-20" />
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-hidden bg-muted/15">
				<MessageListLoader />
			</div>
			<div className="flex shrink-0 items-center gap-2 border-t border-border px-4 py-3">
				<Skeleton className="h-11 flex-1 rounded-2xl" />
				<Skeleton className="size-10 rounded-full" />
			</div>
		</div>
	);
}

export { DiscussionDetailLoader };
