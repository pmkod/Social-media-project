import {
	RiCalendar2Line,
	RiLinkM,
	RiLoader4Line,
	RiMapPin2Line,
} from "@remixicon/react";
import type { MouseEventHandler, ReactNode } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/core/components/ui/hover-card.tsx";
import type { User } from "../common/user.ts";
import { UserProfileLink } from "../common/user-profile-link.tsx";
import { useFollowUser } from "./use-follow-user.ts";
import { useUnfollowUser } from "./use-unfollow-user.ts";
import { useUserProfile } from "./use-user-profile.ts";

const numberFormatter = new Intl.NumberFormat("fr-FR", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const joinedDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	month: "long",
	year: "numeric",
});

type UserProfileHoverCardProps = {
	username?: string | null;
	children: ReactNode;
	className?: string;
	onClick?: MouseEventHandler<HTMLAnchorElement>;
};

function UserProfileHoverCard({
	username,
	children,
	className,
	onClick,
}: UserProfileHoverCardProps) {
	const profileUsername = username ?? "";
	const profileQuery = useUserProfile(profileUsername);
	const followUser = useFollowUser(profileUsername);
	const unfollowUser = useUnfollowUser(profileUsername);
	const user = profileQuery.data;
	const isFollowMutationPending =
		followUser.isPending || unfollowUser.isPending;

	const handleFollowToggle = () => {
		if (!user || isFollowMutationPending) return;
		if (user.isFollowedByAuthenticatedUser) {
			unfollowUser.mutate(user.id);
		} else {
			followUser.mutate(user.id);
		}
	};

	return (
		<HoverCard openDelay={300} closeDelay={120}>
			<HoverCardTrigger asChild>
				<UserProfileLink
					username={username}
					className={className}
					onClick={onClick}
				>
					{children}
				</UserProfileLink>
			</HoverCardTrigger>

			{username ? (
				<HoverCardContent
					align="start"
					sideOffset={8}
					className="w-[min(20rem,calc(100vw-2rem))] p-4"
				>
					{profileQuery.isLoading ? (
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							<RiLoader4Line className="size-5 animate-spin" />
						</div>
					) : profileQuery.isError || !user ? (
						<p className="py-3 text-sm text-muted-foreground">
							Profil indisponible.
						</p>
					) : (
						<UserProfilePreview
							user={user}
							isFollowMutationPending={isFollowMutationPending}
							onFollowToggle={handleFollowToggle}
						/>
					)}
				</HoverCardContent>
			) : null}
		</HoverCard>
	);
}

type UserProfilePreviewProps = {
	user: User;
	isFollowMutationPending: boolean;
	onFollowToggle: () => void;
};

function UserProfilePreview({
	user,
	isFollowMutationPending,
	onFollowToggle,
}: UserProfilePreviewProps) {
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
				<UserProfileLink username={user.username} className="shrink-0">
					<img
						src={avatar}
						alt={displayName}
						className="size-16 rounded-full border-2 border-background object-cover shadow-sm ring-1 ring-border"
					/>
				</UserProfileLink>

				{user.isOwnProfile ? (
					<span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
						Votre profil
					</span>
				) : (
					<Button
						type="button"
						variant={user.isFollowedByAuthenticatedUser ? "outline" : "default"}
						size="sm"
						className="rounded-full px-4 font-bold"
						disabled={isFollowMutationPending}
						onClick={(event) => {
							event.stopPropagation();
							onFollowToggle();
						}}
					>
						{isFollowMutationPending
							? "Mise à jour..."
							: user.isFollowedByAuthenticatedUser
								? "Abonné"
								: "Suivre"}
					</Button>
				)}
			</div>

			<div className="mt-3">
				<UserProfileLink
					username={user.username}
					className="block min-w-0 hover:underline"
				>
					<p className="truncate font-bold text-foreground">{displayName}</p>
					<p className="truncate text-sm text-muted-foreground">
						@{user.username}
					</p>
				</UserProfileLink>
			</div>

			{user.bio ? (
				<p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
					{user.bio}
				</p>
			) : null}

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
						Inscrit en {joinedDate}
					</span>
				) : null}
			</div>

			<div className="mt-3 flex gap-4 text-sm text-muted-foreground">
				<span>
					<strong className="text-foreground">
						{numberFormatter.format(user.followingCount ?? 0)}
					</strong>{" "}
					Abonnements
				</span>
				<span>
					<strong className="text-foreground">
						{numberFormatter.format(user.followersCount ?? 0)}
					</strong>{" "}
					Abonnés
				</span>
			</div>
		</div>
	);
}

export { UserProfileHoverCard };
