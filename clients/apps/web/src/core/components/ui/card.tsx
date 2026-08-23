import type * as React from "react";

import { cn } from "@/core/lib/utils.ts";

function Card({
	className,
	size = "default",
	...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
	return (
		<div
			data-slot="card"
			data-size={size}
			className={cn(
				"group/card flex flex-col overflow-hidden rounded-xl bg-card text-sm text-card-foreground border has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				"group/card-header @container/card-header h-16 flex items-center px-6",
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-title"
			className={cn(
				"font-heading text-lg leading-normal font-semibold group-data-[size=sm]/card:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

function CardContent({
	className,
	paddingZero = false,
	...props
}: React.ComponentProps<"div"> & { paddingZero?: boolean }) {
	return (
		<div
			data-slot="card-content"
			className={cn(
				paddingZero ? "p-0" : "px-6 group-data-[size=sm]/card:px-4",
				className,
			)}
			{...props}
		/>
	);
}

export { Card, CardHeader, CardTitle, CardContent };
