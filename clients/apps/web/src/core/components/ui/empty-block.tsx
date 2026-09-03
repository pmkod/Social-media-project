import { RiRefreshLine } from "@remixicon/react";
import type * as React from "react";

import { Button } from "@/core/components/ui/button.tsx";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/core/components/ui/empty.tsx";
import { cn } from "@/core/lib/utils.ts";

type EmptyBlockProps = {
	title: React.ReactNode;
	description: React.ReactNode;
	onRefresh?: () => void;
	isRefetching?: boolean;
	bordered?: boolean;
	className?: string;
};

function EmptyBlock({
	title,
	description,
	onRefresh,
	isRefetching = false,
	bordered = true,
	className,
}: EmptyBlockProps) {
	return (
		<Empty
			className={cn(
				"min-h-56 bg-background",
				bordered ? "border border-border" : "border-0",
				className,
				!bordered && "border-0",
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
						isLoading={isRefetching}
						onClick={() => void onRefresh()}
					>
						{!isRefetching ? <RiRefreshLine /> : null}
						Refresh
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}

export { EmptyBlock };
