import { cn } from "@/core/lib/utils.ts";

function Separator({
	className,
	orientation = "horizontal",
	...props
}: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
	return (
		<div
			data-slot="separator"
			data-orientation={orientation}
			className={cn(
				"shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
