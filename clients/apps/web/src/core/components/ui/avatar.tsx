import { cva, type VariantProps } from "class-variance-authority";
import { Avatar as AvatarPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/core/lib/utils.ts";

const avatarVariants = cva(
	"group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none",
	{
		variants: {
			size: {
				xs: "size-6 text-xs",
				sm: "size-8 text-xs",
				default: "size-10 text-sm",
				md: "size-10 text-sm",
				lg: "size-12 text-base",
				xl: "size-16 text-lg",
				"2xl": "size-20 text-xl",
				"3xl": "size-24 text-2xl",
				"4xl": "size-32 text-3xl sm:size-36",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> &
	VariantProps<typeof avatarVariants>;

function Avatar({ className, size = "default", ...props }: AvatarProps) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			className={cn(avatarVariants({ size }), className)}
			{...props}
		/>
	);
}

function AvatarImage({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn("aspect-square size-full object-cover", className)}
			{...props}
		/>
	);
}

function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarImage, AvatarFallback };
export type { AvatarProps };
