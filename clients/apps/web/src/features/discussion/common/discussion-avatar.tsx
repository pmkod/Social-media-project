import { RiGroupLine } from "@remixicon/react";
import { cn } from "@/core/lib/utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { DiscussionTypes } from "./discussion.constants.ts";
import type { Discussion } from "./discussion.ts";
import { getOtherDiscussionMember } from "./discussion.utils.ts";

type DiscussionAvatarProps = {
	discussion: Discussion;
	authenticatedUserId?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
};

const sizeClasses = {
	sm: "size-9",
	md: "size-11",
	lg: "size-12",
} as const;

function DiscussionAvatar({
	discussion,
	authenticatedUserId,
	size = "md",
	className,
}: DiscussionAvatarProps) {
	if (discussion.type === DiscussionTypes.PRIVATE) {
		const otherMember = getOtherDiscussionMember(
			discussion,
			authenticatedUserId,
		);
		return (
			<UserAvatar
				user={otherMember?.user ?? undefined}
				className={cn(sizeClasses[size], className)}
			/>
		);
	}

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/10",
				sizeClasses[size],
				className,
			)}
		>
			<RiGroupLine className={size === "sm" ? "size-4" : "size-5"} />
		</div>
	);
}

export { DiscussionAvatar };
