import { cn } from "@/core/lib/utils.ts";
import { FollowButton } from "../follow-button.tsx";
import type { User } from "../user.ts";
import { UserProfileHoverCard } from "../../profile/user-profile-hover-card.tsx";
import { useNavigate } from "@tanstack/react-router";
import { UserProfileLink } from "../user-profile-link.tsx";

type UserRowItemProps = {
	user: User;
};

function UserRowItem({ user }: UserRowItemProps) {
	const avatar =
		user.avatarUrl ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;

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
					{/* <UserProfileLink user={user} onClick={(e) => e.stopPropagation()}> */}
					<img
						src={avatar}
						alt={user.fullName}
						className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
					/>
					{/* </UserProfileLink> */}
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
