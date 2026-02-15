import { cn } from "@/core/lib/utils";
import { User } from "lucide-react";
import { Avatar as AvatarPrimitive } from "radix-ui";
import * as React from "react";

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
	size?: "default" | "sm" | "lg";
	src?: string;
};

function Avatar({
	className,
	size = "default",
	children,
	src,
	...props
}: AvatarProps) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			className={cn(
				"group/avatar relative flex size-10 shrink-0 overflow-hidden rounded-lg select-none data-[size=lg]:size-12 data-[size=sm]:size-8",
				className,
			)}
			{...props}
		>
			<AvatarPrimitive.Image
				data-slot="avatar-image"
				className={cn("aspect-square size-full")}
				src={src}
			/>

			<AvatarPrimitive.Fallback
				data-slot="avatar-fallback"
				className={cn(
					"size-full bg-muted text-muted-foreground flex items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
				)}
			>
				<User className="size-1/2" />
			</AvatarPrimitive.Fallback>
		</AvatarPrimitive.Root>
	);
}

// function AvatarImage({
// 	className,
// 	...props
// }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
// 	return (
// 	);
// }

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="avatar-badge"
			className={cn(
				"bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none",
				"group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
				"group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
				"group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				"*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
				className,
			)}
			{...props}
		/>
	);
}

function AvatarGroupCount({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="avatar-group-count"
			className={cn(
				"bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
				className,
			)}
			{...props}
		/>
	);
}

export { Avatar, AvatarBadge, AvatarGroup, AvatarGroupCount };
