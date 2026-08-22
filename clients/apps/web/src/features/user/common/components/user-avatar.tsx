import { RiUserLine } from "@remixicon/react";
import type * as React from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	type AvatarProps,
} from "@/core/components/ui/avatar.tsx";
import { cn } from "@/core/lib/utils.ts";
import { buildImageUrl } from "@/features/post/post-media.functions.ts";
import type { User } from "../user.ts";

function getInitials(name?: string | null): string {
	if (!name) return "";
	const trimmed = name.trim();
	if (!trimmed) return "";
	const parts = trimmed.split(/\s+/);
	if (parts.length === 1 && parts[0]) {
		return parts[0].slice(0, 1).toUpperCase();
	}
	if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	return "";
}

export type UserAvatarProps = Omit<AvatarProps, "children"> & {
	user?: User;
	fallback?: React.ReactNode;
};

function UserAvatar({
	user,
	size = "default",
	className,
	...props
}: UserAvatarProps) {
	const lowQualityProfilePictureFileUrl = buildImageUrl(
		user?.lowQualityProfilePictureFile?.name ??
			user?.bestQualityProfilePictureFile?.name,
	);
	const fullName = user?.fullName;
	const initials = getInitials(fullName);

	return (
		<Avatar size={size} className={cn("shrink-0", className)} {...props}>
			{lowQualityProfilePictureFileUrl ? (
				<AvatarImage
					src={lowQualityProfilePictureFileUrl}
					alt={fullName || "User avatar"}
				/>
			) : null}
			<AvatarFallback>
				{initials || <RiUserLine className="size-1/2 opacity-70" />}
			</AvatarFallback>
		</Avatar>
	);
}

export { UserAvatar };
