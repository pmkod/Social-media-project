import { RiCalendar2Line, RiLoader4Line } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderGoBackButton,
	AppHeaderLeftPart,
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
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { ListFollowersModal } from "@/features/user/list-followers/list-followers.modal.tsx";
import { ListFollowingModal } from "@/features/user/list-following/list-following.modal.tsx";
import { useUserProfile } from "@/features/user/user-profile/use-user-profile.ts";
import { UserProfileActionsDropdown } from "@/features/user/user-profile/user-profile-actions-dropdown.tsx";
import { EditProfileModal } from "./edit-profile.modal.tsx";
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
	const profileQuery = useUserProfile({ username });
	const { data: authenticatedUser } = useAuthenticatedUser();

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

	const joinedDate = user.createdAt
		? joinedDateFormatter.format(new Date(user.createdAt))
		: null;
	const hasBlockRelationship =
		user.isBlockedByAuthenticatedUser || user.hasBlockedAuthenticatedInUser;
	const isOwnProfile = Boolean(
		authenticatedUser?.id && user && authenticatedUser.id === user.id,
	);

	return (
		<div className="mx-auto">
			<AppHeader bordered>
				<AppHeaderLeftPart>
					<AppHeaderGoBackButton to="/home" />
					<div className="min-w-0">
						<AppHeaderTitle>{user.fullName}</AppHeaderTitle>
					</div>
				</AppHeaderLeftPart>
			</AppHeader>

			<section className="border-x rounded-t-xl overflow-hidden">
				<div className="h-48 overflow-hidden bg-gradient-to-br from-slate-700 via-slate-500 to-sky-300 sm:h-56">
					{(user.lowQualityCoverPictureUrl ?? user.coverPictureUrl) ? (
						<img
							src={user.lowQualityCoverPictureUrl ?? user.coverPictureUrl ?? ""}
							alt={`${user.fullName}'s cover`}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.32),transparent_32%),linear-gradient(135deg,transparent_35%,rgba(255,255,255,0.12)_35%,rgba(255,255,255,0.12)_52%,transparent_52%)]" />
					)}
				</div>

				<div className="px-8 pb-5">
					<div className="flex items-start justify-between">
						<UserAvatar
							user={user}
							size="4xl"
							className="-mt-16 border-4 border-background bg-background shadow-sm"
						/>

						<div className="flex items-center gap-2 pt-3">
							<UserProfileActionsDropdown user={user} variant="outline" />
							{isOwnProfile ? (
								<Button
									variant="outline"
									onClick={() =>
										void NiceModal.show(EditProfileModal, { user })
									}
								>
									Edit profile
								</Button>
							) : !hasBlockRelationship ? (
								<FollowButton user={user} />
							) : null}
						</div>
					</div>

					<div className="mt-3">
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{user.fullName}
						</h2>
						<p className="text-muted-foreground">@{user.username}</p>
					</div>

					{!hasBlockRelationship && user.bio ? (
						<p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
							{user.bio}
						</p>
					) : null}

					{!hasBlockRelationship && joinedDate ? (
						<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<RiCalendar2Line className="size-4" />
								Joined {joinedDate}
							</span>
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
