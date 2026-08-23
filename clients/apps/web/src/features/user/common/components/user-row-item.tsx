import type { MouseEventHandler } from "react";
import { cn } from "@/core/lib/utils.ts";
import { UserProfileHoverCard } from "../../user-profile/user-profile-hover-card.tsx";
import { FollowButton } from "../follow-button.tsx";
import type { User } from "../user.ts";
import { UserProfileLink } from "../user-profile-link.tsx";
import { UserAvatar } from "./user-avatar.tsx";

type UserRowItemProps = {
	user: User;
	onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function UserRowItem({ user, onClick }: UserRowItemProps) {
	return (
		<UserProfileLink
			className={cn(
				"flex items-center w-full justify-between gap-3 px-6 py-3 transition-colors hover:bg-gray-100/80 cursor-pointer",
			)}
			user={user}
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(e);
			}}
		>
			<div className="flex items-center justify-start gap-2.5">
				<UserProfileHoverCard user={user}>
					<UserAvatar user={user} size="md" />
				</UserProfileHoverCard>

				<div className="min-w-0 flex-1 flex flex-col items-start">
					<UserProfileHoverCard user={user}>
						<div className="truncate font-semibold text-sm text-foreground group-hover:underline">
							{user.fullName}
						</div>
					</UserProfileHoverCard>
					<UserProfileHoverCard user={user}>
						<div className="truncate text-muted-foreground text-sm">
							@{user.username}
						</div>
					</UserProfileHoverCard>
				</div>
			</div>
			<FollowButton user={user} />
		</UserProfileLink>
	);
}

export { UserRowItem };
