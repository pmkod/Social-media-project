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
	borderless?: boolean;
	className?: string;
};

function EmptyBlock({
	title,
	description,
	onRefresh,
	borderless = false,
	className,
}: EmptyBlockProps) {
	return (
		<Empty
			className={cn(
				"min-h-56 bg-background",
				borderless ? "border-0" : "border border-border",
				className,
				borderless && "border-0",
			)}
		>
			<EmptyHeader>
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
						Refresh
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}

export { EmptyBlock };
export type { EmptyBlockProps };
