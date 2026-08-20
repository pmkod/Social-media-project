import { RiUserLine } from "@remixicon/react";
import type * as React from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	type AvatarProps,
} from "@/core/components/ui/avatar.tsx";
import { cn } from "@/core/lib/utils.ts";
import type { User } from "../user.ts";

export type UserAvatarSize = NonNullable<AvatarProps["size"]>;

export type UserAvatarUser = Partial<User> & {
	fullName?: string | null;
	username?: string | null;
	profilePictureUrl?: string | null;
	lowQualityProfilePictureUrl?: string | null;
};

export type UserAvatarProps = Omit<AvatarProps, "children"> & {
	user?: UserAvatarUser | null;
	fallback?: React.ReactNode;
};

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

function UserAvatar({
	user,
	size = "default",
	className,
	fallback,
	...props
}: UserAvatarProps) {
	const profilePictureUrl =
		user?.lowQualityProfilePictureUrl ?? user?.profilePictureUrl;
	const fullName = user?.fullName;
	const initials = getInitials(fullName);

	return (
		<Avatar size={size} className={cn("shrink-0", className)} {...props}>
			{profilePictureUrl ? (
				<AvatarImage src={profilePictureUrl} alt={fullName || "User avatar"} />
			) : null}
			<AvatarFallback>
				{fallback ??
					(initials || <RiUserLine className="size-1/2 opacity-70" />)}
			</AvatarFallback>
		</Avatar>
	);
}

export { UserAvatar };
