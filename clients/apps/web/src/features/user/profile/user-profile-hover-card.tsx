import { RiCalendar2Line, RiLinkM, RiMapPin2Line } from "@remixicon/react";
import type { ReactNode } from "react";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/core/components/ui/hover-card.tsx";
import { Skeleton } from "@/core/components/ui/skeleton.tsx";
import { cn } from "@/core/lib/utils.ts";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import type { User } from "../common/user.ts";

const numberFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const joinedDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
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

			{/* Meta details (location, website, joined date) */}
			<div className="flex flex-wrap gap-x-3 gap-y-1.5">
				<Skeleton className="h-3.5 w-14 rounded" />
				<Skeleton className="h-3.5 w-16 rounded" />
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
	const { data: authenticatedUser } = useAuthenticatedUser();
	const isOwnProfile = Boolean(
		authenticatedUser?.id && user.id && authenticatedUser.id === user.id,
	);
	const displayName = user.displayName || user.fullName || user.username;
	const avatar =
		user.avatarUrl ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
	const joinedDate = user.createdAt
		? joinedDateFormatter.format(new Date(user.createdAt))
		: null;

	return (
		<div>
			<div className="flex items-start justify-between gap-3">
				<div className="shrink-0">
					<img
						src={avatar}
						alt={user.fullName}
						className="size-16 rounded-full border-2 border-background object-cover shadow-sm ring-1 ring-border"
					/>
				</div>

				{isOwnProfile ? (
					<span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
						Your profile
					</span>
				) : !user.isBlockedByAuthenticatedUser &&
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

			{!user.isBlockedByAuthenticatedUser &&
			!user.hasBlockedAuthenticatedInUser ? (
				<div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
					{user.location ? (
						<span className="flex items-center gap-1">
							<RiMapPin2Line className="size-3.5" />
							{user.location}
						</span>
					) : null}
					{user.website ? (
						<a
							href={user.website}
							target="_blank"
							rel="noreferrer"
							className="flex items-center gap-1 text-sky-500 hover:underline"
						>
							<RiLinkM className="size-3.5" />
							{user.website.replace(/^https?:\/\//, "")}
						</a>
					) : null}
					{joinedDate ? (
						<span className="flex items-center gap-1">
							<RiCalendar2Line className="size-3.5" />
							Joined {joinedDate}
						</span>
					) : null}
				</div>
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
