import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/core/lib/utils.ts";

function Exception({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="exception"
			className={cn(
				"flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg p-6 text-center md:p-12",
				className,
			)}
			{...props}
		/>
	);
}

function ExceptionHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="exception-header"
			className={cn(
				"flex max-w-sm flex-col items-center gap-1 text-center",
				className,
			)}
			{...props}
		/>
	);
}

const exceptionMediaVariants = cva(
	"mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function ExceptionMedia({
	className,
	variant = "default",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof exceptionMediaVariants>) {
	return (
		<div
			data-slot="exception-media"
			data-variant={variant}
			className={cn(exceptionMediaVariants({ variant, className }))}
			{...props}
		/>
	);
}

function ExceptionTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="exception-title"
			className={cn("text-lg font-medium tracking-tight", className)}
			{...props}
		/>
	);
}

function ExceptionDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<div
			data-slot="exception-description"
			className={cn(
				"text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
				className,
			)}
			{...props}
		/>
	);
}

function ExceptionContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="exception-content"
			className={cn(
				"flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Exception,
	ExceptionHeader,
	ExceptionTitle,
	ExceptionDescription,
	ExceptionContent,
	ExceptionMedia,
};
