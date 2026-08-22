import type { ReactNode } from "react";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/core/components/ui/hover-card.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import type { User } from "../common/user.ts";

const numberFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

type UserProfilePreviewLoaderProps = {
	className?: string;
};

function UserProfilePreviewLoader({
	className,
}: UserProfilePreviewLoaderProps) {
	return (
		<div className={cn("space-y-5", className)} aria-hidden="true">
			{/* Top Row: Avatar & Follow Button */}
			<div className="flex items-start justify-between gap-3">
				<Skeleton className="size-16 rounded-full shrink-0" />
				<Skeleton className="h-8 w-20 rounded-full shrink-0" />
			</div>

			<div className="space-y-1.5">
				<Skeleton className="h-4 w-32 rounded" />
				<Skeleton className="h-3.5 w-20 rounded" />
			</div>

			<div className="space-y-1.5">
				<Skeleton className="h-3.5 w-full rounded" />
				<Skeleton className="h-3.5 w-4/5 rounded" />
			</div>
		</div>
	);
}

type UserProfileHoverCardProps = {
	user: User;
	children: ReactNode;
};

function UserProfileHoverCard({ user, children }: UserProfileHoverCardProps) {
	const profileQuery = useUserProfile({ username: user.username });
	const profileUser = profileQuery.data?.user ?? user;

	return (
		<HoverCard openDelay={300} closeDelay={120}>
			<HoverCardTrigger asChild>{children}</HoverCardTrigger>

			<HoverCardContent
				align="start"
				sideOffset={8}
				className="w-[min(20rem,calc(100vw-2rem))] p-4"
			>
				{profileQuery.isLoading ? (
					<UserProfilePreviewLoader />
				) : profileQuery.isError ? (
					<ExceptionBlock
						title="Unable to load profile"
						onRefresh={profileQuery.refetch}
						borderless
					/>
				) : (
					<UserProfilePreview user={profileUser} />
				)}
			</HoverCardContent>
		</HoverCard>
	);
}

type UserProfilePreviewProps = {
	user: User;
};

function UserProfilePreview({ user }: UserProfilePreviewProps) {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const isOwnProfile = Boolean(
		authenticatedUser?.id && user.id && authenticatedUser.id === user.id,
	);

	return (
		<div>
			<div className="flex items-start justify-between gap-3">
				<div className="shrink-0">
					<UserAvatar user={user} size="xl" />
				</div>

				{isOwnProfile ? null : !user.isBlockedByAuthenticatedUser &&
					!user.hasBlockedAuthenticatedInUser ? (
					<FollowButton user={user} />
				) : null}
			</div>

			<div className="mt-3">
				<div className="block min-w-0 hover:underline">
					<p className="truncate font-bold text-foreground">{user.fullName}</p>
					<p className="truncate text-sm text-muted-foreground">
						@{user.username}
					</p>
				</div>
			</div>

			{!user.isBlockedByAuthenticatedUser &&
			!user.hasBlockedAuthenticatedInUser &&
			user.bio ? (
				<p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
					{user.bio}
				</p>
			) : null}

			<div className="mt-3 flex gap-4 text-sm text-muted-foreground">
				<span>
					<strong className="text-foreground">
						{numberFormatter.format(user.followingCount ?? 0)}
					</strong>{" "}
					Following
				</span>
				<span>
					<strong className="text-foreground">
						{numberFormatter.format(user.followersCount ?? 0)}
					</strong>{" "}
					Followers
				</span>
			</div>
		</div>
	);
}

export { UserProfileHoverCard, UserProfilePreviewLoader };
export type { UserProfileHoverCardProps, UserProfilePreviewLoaderProps };
