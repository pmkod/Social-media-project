import { Tabs as TabsPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/core/lib/utils.ts";

function UserProfileTab({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col", className)}
			{...props}
		/>
	);
}

function UserProfileTabList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn("flex w-full border-border border-x text-xl", className)}
			{...props}
		/>
	);
}

function UserProfileTabTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"relative flex-1 px-3 py-2 flex items-center justify-center gap-x-1.5 cursor-pointer text-lg font-normal text-muted-foreground transition hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-sky-500 data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:bottom-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function UserProfileTabContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("outline-none", className)}
			{...props}
		/>
	);
}

export {
	UserProfileTab,
	UserProfileTabContent,
	UserProfileTabList,
	UserProfileTabTrigger,
};
