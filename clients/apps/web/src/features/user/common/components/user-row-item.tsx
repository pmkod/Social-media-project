import { cn } from "@/core/lib/utils.ts";
import { FollowButton } from "../follow-button.tsx";
import type { User } from "../user.ts";
import { UserProfileLink } from "../user-profile-link.tsx";

type UserRowItemProps = {
	user: User;
	className?: string;
};

function UserRowItem({ user, className }: UserRowItemProps) {
	const avatar =
		user.avatarUrl ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-gray-100/80 dark:hover:bg-gray-800/50",
				className,
			)}
		>
			<UserProfileLink
				username={user.username}
				className="group flex min-w-0 flex-1 items-center gap-2.5"
			>
				<img
					src={avatar}
					alt={user.fullName}
					className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
				/>
				<div className="min-w-0 flex-1">
					<div className="truncate font-semibold text-sm text-foreground group-hover:underline">
						{user.fullName}
					</div>
					<div className="truncate text-muted-foreground text-xs">
						@{user.username}
					</div>
				</div>
			</UserProfileLink>
			<FollowButton user={user} />
		</div>
	);
}

export { UserRowItem };
export type { UserRowItemProps };
