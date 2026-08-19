import {
	RiCalendar2Line,
	RiLinkM,
	RiLoader4Line,
	RiMapPin2Line,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
	AppHeaderSubtitle,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { Button } from "@/core/components/ui/button.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/core/components/ui/tabs.tsx";
import { UserActionsDropdown } from "@/features/user/block-user/user-actions-dropdown.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { ListFollowersModal } from "@/features/user/list-followers/list-followers.modal.tsx";
import { ListFollowingModal } from "@/features/user/list-following/list-following.modal.tsx";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import { ProfileCollections } from "./profile-collections.tsx";
import { ProfilePostList } from "./profile-post-list.tsx";

const numberFormatter = new Intl.NumberFormat("en-US", { notation: "compact" });
const joinedDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

type ProfileViewProps = {
	username: string;
};

export function ProfileView({ username }: ProfileViewProps) {
	const profileQuery = useUserProfile(username);

	if (profileQuery.isLoading) {
		return (
			<div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center border-x border-border">
				<RiLoader4Line className="size-8 animate-spin text-sky-500" />
			</div>
		);
	}

	const user = profileQuery.data?.user;
	if (profileQuery.isError || !user) {
		return (
			<div className="mx-auto min-h-screen max-w-2xl border-x border-border p-12 text-center">
				<h1 className="text-xl font-bold text-foreground">
					This account doesn't exist
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Check the username and try again.
				</p>
				<Button asChild variant="outline" className="mt-5">
					<Link to="/search">Back to search</Link>
				</Button>
			</div>
		);
	}

	const displayName = user.displayName || user.fullName || user.username;
	const avatar =
		user.avatarUrl ||
		`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
	const joinedDate = user.createdAt
		? joinedDateFormatter.format(new Date(user.createdAt))
		: null;
	const hasBlockRelationship =
		user.isBlockedByAuthenticatedUser || user.hasBlockedAuthenticatedInUser;

	return (
		<div className="mx-auto">
			<AppHeader bordered>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<div className="min-w-0">
						<AppHeaderTitle>{displayName}</AppHeaderTitle>
						<AppHeaderSubtitle>
							{numberFormatter.format(user.postCount ?? 0)} posts
						</AppHeaderSubtitle>
					</div>
				</AppHeaderLeftPart>
			</AppHeader>

			<section>
				<div className="h-48 overflow-hidden bg-gradient-to-br from-slate-700 via-slate-500 to-sky-300 sm:h-56">
					{user.coverUrl ? (
						<img
							src={user.coverUrl}
							alt={`${displayName}'s cover`}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.32),transparent_32%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.12)_35%,rgba(255,255,255,0.12)_52%,transparent_52%)]" />
					)}
				</div>

				<div className="px-4 pb-5">
					<div className="flex items-start justify-between">
						<img
							src={avatar}
							alt={displayName}
							className="-mt-16 size-32 rounded-full border-4 border-background bg-background object-cover shadow-sm sm:size-36"
						/>

						<div className="flex items-center gap-2 pt-3">
							<UserActionsDropdown
								user={user}
								resource={{ type: "profile" }}
								variant="outline"
								size="lg"
							/>
							{user.isOwnProfile ? (
								<span className="inline-flex h-9 items-center rounded-full border border-border px-5 text-sm font-bold text-foreground">
									Your profile
								</span>
							) : !hasBlockRelationship ? (
								<FollowButton user={user} size="lg" />
							) : null}
						</div>
					</div>

					<div className="mt-3">
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{displayName}
						</h2>
						<p className="text-muted-foreground">@{user.username}</p>
					</div>

					{!hasBlockRelationship && user.bio ? (
						<p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
							{user.bio}
						</p>
					) : null}

					{!hasBlockRelationship ? (
						<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
							{user.location ? (
								<span className="flex items-center gap-1.5">
									<RiMapPin2Line className="size-4" />
									{user.location}
								</span>
							) : null}
							{user.website ? (
								<a
									href={user.website}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1.5 text-sky-500 hover:underline"
								>
									<RiLinkM className="size-4" />
									{user.website.replace(/^https?:\/\//, "")}
								</a>
							) : null}
							{joinedDate ? (
								<span className="flex items-center gap-1.5">
									<RiCalendar2Line className="size-4" />
									Joined {joinedDate}
								</span>
							) : null}
						</div>
					) : null}

					<div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
						<span>
							<strong className="text-foreground">
								{numberFormatter.format(user.postCount ?? 0)}
							</strong>{" "}
							Posts
						</span>
						<button
							type="button"
							disabled={Boolean(hasBlockRelationship)}
							onClick={() =>
								NiceModal.show(ListFollowersModal, {
									userId: user.id,
									username: user.username,
								})
							}
							className="rounded-sm text-left transition enabled:hover:text-foreground enabled:hover:underline"
						>
							<strong className="text-foreground">
								{numberFormatter.format(user.followersCount ?? 0)}
							</strong>{" "}
							Followers
						</button>
						<button
							type="button"
							disabled={Boolean(hasBlockRelationship)}
							onClick={() =>
								NiceModal.show(ListFollowingModal, {
									userId: user.id,
									username: user.username,
								})
							}
							className="rounded-sm text-left transition enabled:hover:text-foreground enabled:hover:underline"
						>
							<strong className="text-foreground">
								{numberFormatter.format(user.followingCount ?? 0)}
							</strong>{" "}
							Following
						</button>
					</div>
				</div>
			</section>

			{!hasBlockRelationship ? (
				<Tabs defaultValue="posts">
					<TabsList>
						<TabsTrigger value="posts">Posts</TabsTrigger>
						<TabsTrigger value="likes">Likes</TabsTrigger>
						<TabsTrigger value="collections">Collections</TabsTrigger>
					</TabsList>
					<TabsContent value="posts">
						<ProfilePostList userId={user.id} type="posts" />
					</TabsContent>
					<TabsContent value="likes">
						<ProfilePostList userId={user.id} type="likes" />
					</TabsContent>
					<TabsContent value="collections">
						<ProfileCollections userId={user.id} />
					</TabsContent>
				</Tabs>
			) : null}
		</div>
	);
}
