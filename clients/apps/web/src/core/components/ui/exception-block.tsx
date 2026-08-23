import { RefreshCcwIcon } from "lucide-react";
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
	borderless?: boolean;
	className?: string;
};

function ExceptionBlock({
	title,
	description,
	onRefresh,
	isRefetching = false,
	borderless = false,
	className,
}: ExceptionBlockProps) {
	return (
		<Exception
			className={cn(
				" bg-background",
				borderless ? "border-0" : "border border-border",
				className,
				borderless && "border-0",
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
						{!isRefetching ? <RefreshCcwIcon /> : null}
						Refresh
					</Button>
				</ExceptionContent>
			) : null}
		</Exception>
	);
}

export { ExceptionBlock };
