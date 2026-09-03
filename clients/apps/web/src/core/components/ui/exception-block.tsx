import { RiRefreshLine } from "@remixicon/react";
import type * as React from "react";

import { Button } from "@/core/components/ui/button.tsx";
import {
	Exception,
	ExceptionContent,
	ExceptionDescription,
	ExceptionHeader,
	ExceptionTitle,
} from "@/core/components/ui/exception.tsx";
import { cn } from "@/core/lib/utils.ts";

type ExceptionBlockProps = {
	title?: React.ReactNode;
	description?: React.ReactNode;
	onRefresh?: () => void;
	isRefetching?: boolean;
	bordered?: boolean;
	className?: string;
};

function ExceptionBlock({
	title,
	description,
	onRefresh,
	isRefetching = false,
	bordered = true,
	className,
}: ExceptionBlockProps) {
	return (
		<Exception
			className={cn(
				" bg-background",
				bordered ? "border border-border" : "border-0",
				className,
				!bordered && "border-0",
			)}
		>
			<ExceptionHeader>
				<ExceptionTitle>{title}</ExceptionTitle>
				<ExceptionDescription>{description}</ExceptionDescription>
			</ExceptionHeader>
			{onRefresh ? (
				<ExceptionContent>
					<Button
						type="button"
						variant="outline"
						isLoading={isRefetching}
						onClick={() => void onRefresh()}
					>
						{!isRefetching ? <RiRefreshLine /> : null}
						Refresh
					</Button>
				</ExceptionContent>
			) : null}
		</Exception>
	);
}

export { ExceptionBlock };
