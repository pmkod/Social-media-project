import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/core/lib/utils.ts";

const iconButtonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				outline:
					"border-border bg-background text-foreground shadow-xs hover:bg-accent",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
			},
			colorScheme: {
				primary: "",
				destructive: "",
			},
			size: {
				xs: "size-7 [&_svg]:size-3.5",
				sm: "size-8 [&_svg]:size-4",
				md: "size-9 [&_svg]:size-5",
				lg: "size-10 [&_svg]:size-5",
			},
		},
		compoundVariants: [
			{
				variant: "default",
				colorScheme: "destructive",
				className: "bg-destructive text-white hover:bg-destructive/90",
			},
			{
				variant: "outline",
				colorScheme: "destructive",
				className:
					"border-destructive text-destructive hover:bg-destructive/10",
			},
			{
				variant: "secondary",
				colorScheme: "destructive",
				className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
			},
			{
				variant: "ghost",
				colorScheme: "destructive",
				className: "text-destructive hover:bg-destructive/10",
			},
		],
		defaultVariants: {
			variant: "default",
			colorScheme: "primary",
			size: "md",
		},
	},
);

function IconButton({
	className,
	variant = "default",
	colorScheme = "primary",
	size = "md",
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
	return (
		<button
			data-slot="icon-button"
			className={cn(
				iconButtonVariants({ variant, colorScheme, size, className }),
			)}
			{...props}
		/>
	);
}

export { IconButton, iconButtonVariants };
