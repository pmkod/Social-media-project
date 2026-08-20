import { RiLoader4Line } from "@remixicon/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/core/lib/utils.ts";

const buttonVariants = cva(
	"inline-flex shrink-0 items-center cursor-pointer justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "",
				outline:
					"border bg-background shadow-xs dark:border-input dark:bg-input/30",
				secondary: "",
				ghost: "",
				link: "underline-offset-4 hover:underline",
			},
			colorScheme: {
				primary: "",
				destructive: "",
				white: "",
			},
			fullWidth: {
				true: "w-full",
			},
			size: {
				default: "h-9 px-4 py-2 rounded has-[>svg]:px-3",
				xs: "h-6 gap-1 rounded px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-8 gap-1.5 rounded px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded px-6 has-[>svg]:px-4",
				xl: "h-12 rounded px-8 has-[>svg]:px-6",
				icon: "size-9 rounded p-0",
				"icon-sm": "size-8 rounded p-0",
			},
		},
		compoundVariants: [
			{
				variant: "default",
				colorScheme: "primary",
				class: "bg-primary text-primary-foreground hover:bg-primary/90",
			},
			{
				variant: "default",
				colorScheme: "destructive",
				class:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
			},
			{
				variant: "outline",
				colorScheme: "primary",
				class:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50",
			},
			{
				variant: "outline",
				colorScheme: "destructive",
				class:
					"border-destructive text-destructive hover:bg-destructive/10 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:hover:bg-destructive/20",
			},
			{
				variant: "secondary",
				colorScheme: "primary",
				class: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			},
			{
				variant: "secondary",
				colorScheme: "destructive",
				class:
					"bg-destructive/10 text-destructive hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
			},
			{
				variant: "ghost",
				colorScheme: "primary",
				class:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			},
			{
				variant: "ghost",
				colorScheme: "destructive",
				class:
					"text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20",
			},
			{
				variant: "link",
				colorScheme: "primary",
				class: "text-primary",
			},
			{
				variant: "link",
				colorScheme: "destructive",
				class: "text-destructive",
			},
			{
				variant: "default",
				colorScheme: "white",
				class: "bg-white text-black hover:bg-white/90",
			},
			{
				variant: "outline",
				colorScheme: "white",
				class: "border-white text-white hover:bg-white/10",
			},
			{
				variant: "secondary",
				colorScheme: "white",
				class: "bg-white/10 text-white hover:bg-white/20",
			},
			{
				variant: "ghost",
				colorScheme: "white",
				class: "text-white hover:bg-white/10",
			},
			{
				variant: "link",
				colorScheme: "white",
				class: "text-white",
			},
		],
		defaultVariants: {
			variant: "default",
			colorScheme: "primary",
			size: "default",
		},
	},
);

type ButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		isLoading?: boolean;
	};

function Button({
	className,
	variant = "default",
	colorScheme = "primary",
	size = "default",
	fullWidth = false,
	asChild = false,
	isLoading = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-color-scheme={colorScheme}
			data-size={size}
			disabled={disabled || isLoading}
			aria-busy={isLoading}
			className={cn(
				buttonVariants({ variant, colorScheme, size, fullWidth, className }),
			)}
			{...props}
		>
			{asChild ? (
				children
			) : (
				<>
					{isLoading ? (
						<RiLoader4Line className="animate-spin shrink-0" />
					) : null}
					{children}
				</>
			)}
		</Comp>
	);
}

export { Button, buttonVariants };
export type { ButtonProps };
