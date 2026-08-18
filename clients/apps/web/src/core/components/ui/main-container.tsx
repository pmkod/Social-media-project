import type * as React from "react";
import { cn } from "@/core/lib/utils.ts";

function MainContainer({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="main-container"
			className={cn("mx-auto max-w-2xl", className)}
			{...props}
		/>
	);
}

export { MainContainer };
