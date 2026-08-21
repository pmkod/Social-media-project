import { cn } from "@/core/lib/utils.ts";
import { UserProfileHoverCard } from "../../get-profile/user-profile-hover-card.tsx";
import { FollowButton } from "../follow-button.tsx";
import type { User } from "../user.ts";
import { UserProfileLink } from "../user-profile-link.tsx";
import { UserAvatar } from "./user-avatar.tsx";

type UserRowItemProps = {
	user: User;
};

function UserRowItem({ user }: UserRowItemProps) {
	return (
		<UserProfileLink
			type="button"
			className={cn(
				"flex items-center w-full justify-between gap-3 px-6 py-3 transition-colors hover:bg-gray-100/80 cursor-pointer",
			)}
			user={user}
			onClick={(e) => e.stopPropagation()}
		>
			<div className="flex items-center justify-start gap-2.5">
				<UserProfileHoverCard user={user}>
					<UserAvatar user={user} size="md" className="ring-1 ring-border" />
				</UserProfileHoverCard>

				<div
					// user={user}
					// onClick={(e) => e.stopPropagation()}
					className="min-w-0 flex-1 flex flex-col items-start"
				>
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
