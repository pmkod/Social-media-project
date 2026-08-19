import {
	RiCalendar2Line,
	RiLinkM,
	RiLoader4Line,
	RiMapPin2Line,
} from "@remixicon/react";
import type { ReactNode } from "react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/core/components/ui/hover-card.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import type { User } from "../common/user.ts";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";

const numberFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const joinedDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

type UserProfileHoverCardProps = {
	user: User;
	children: ReactNode;
};

function UserProfileHoverCard({ user, children }: UserProfileHoverCardProps) {
	const profileQuery = useUserProfile({ username: user.username });

	return (
		<HoverCard openDelay={300} closeDelay={120}>
			<HoverCardTrigger asChild>{children}</HoverCardTrigger>

			<HoverCardContent
				align="start"
				sideOffset={8}
				className="w-[min(20rem,calc(100vw-2rem))] p-4"
			>
				{
					profileQuery.isLoading ? (
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							<RiLoader4Line className="size-5 animate-spin" />
						</div>
					) : profileQuery.isError ? (
						<ExceptionBlock title="Erreur de chargement" description="" />
					) : null
					// <UserProfilePreview user={profileUser} />
				}
			</HoverCardContent>
		</HoverCard>
	);
}

type UserProfilePreviewProps = {
	user: User;
};

function UserProfilePreview({ user }: UserProfilePreviewProps) {
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
						alt={displayName}
						className="size-16 rounded-full border-2 border-background object-cover shadow-sm ring-1 ring-border"
					/>
				</div>

				{user.isOwnProfile ? (
					<span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
						Your profile
					</span>
				) : !user.isBlockedByAuthenticatedUser &&
					!user.hasBlockedAuthenticatedInUser ? (
					<FollowButton user={user} className="rounded-full px-4 font-bold" />
				) : null}
			</div>

			<div className="mt-3">
				<div className="block min-w-0 hover:underline">
					<p className="truncate font-bold text-foreground">{displayName}</p>
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

export { UserProfileHoverCard };
