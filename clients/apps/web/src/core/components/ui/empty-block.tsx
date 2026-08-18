import { InboxIcon, RefreshCcwIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/core/components/ui/button.tsx";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/core/components/ui/empty.tsx";
import { cn } from "@/core/lib/utils.ts";

type EmptyBlockProps = {
	title: React.ReactNode;
	description: React.ReactNode;
	onRefresh?: () => void;
	className?: string;
};

function EmptyBlock({
	title,
	description,
	onRefresh,
	className,
}: EmptyBlockProps) {
	return (
		<Empty
			className={cn("min-h-56 border border-border bg-background", className)}
		>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<InboxIcon />
				</EmptyMedia>
				<EmptyTitle>{title}</EmptyTitle>
				<EmptyDescription>{description}</EmptyDescription>
			</EmptyHeader>
			{onRefresh ? (
				<EmptyContent>
					<Button
						type="button"
						variant="outline"
						onClick={() => void onRefresh()}
					>
						<RefreshCcwIcon />
						Actualiser
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}

export { EmptyBlock };
export type { EmptyBlockProps };
