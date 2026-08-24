import { RiCalendar2Line } from "@remixicon/react";
import { Button } from "@/core/components/ui/button";

import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { buildImageUrl } from "@/features/post/post-media.functions";
import { useOpenUserUnblockAlertDialog } from "@/features/user/block-user/use-open-user-unblock-alert-dialog.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { EditProfileModal } from "@/features/user/edit-profile/edit-profile.modal.tsx";
import { ListFollowersModal } from "@/features/user/list-followers/list-followers.modal.tsx";
import { ListFollowingModal } from "@/features/user/list-following/list-following.modal.tsx";
import { UserProfileActionsDropdown } from "@/features/user/user-profile/user-profile-actions-dropdown.tsx";
import { UserProfileStatItem } from "@/features/user/user-profile/user-profile-stat-item";
import { useAuthenticatedUser } from "../authenticated-user/use-authenticated-user";
import type { User } from "../common/user";

const numberFormatter = new Intl.NumberFormat("en-US", { notation: "compact" });
const joinedDateFormatter = new Intl.DateTimeFormat("en-US", {
	month: "long",
	year: "numeric",
});

type UserProfileViewProps = {
	user: User;
};

function UserProfileView({ user }: UserProfileViewProps) {
	const { data } = useAuthenticatedUser();
	const userUnblockDialog = useOpenUserUnblockAlertDialog();
	const authenticatedUser = data?.user;

	const joinedDate = user.createdAt
		? joinedDateFormatter.format(new Date(user.createdAt))
		: null;

	const isOwnProfile = authenticatedUser?.id === user.id;

	const coverPictureSrc =
		buildImageUrl(
			user.lowQualityCoverPictureFile?.filename ??
				user.bestQualityCoverPictureFile?.filename,
		) || null;
	return (
		<section className="border-x rounded-t-xl overflow-hidden">
			<div className="h-48 sm:h-56">
				{coverPictureSrc ? (
					<img
						src={coverPictureSrc}
						alt={`${user.fullName}'s cover`}
						className="h-full w-full object-cover"
					/>
				) : null}
			</div>

			<div className="px-8 pb-3">
				<div className="flex items-start justify-between">
					<div className="-mt-20 border-4 border-background rounded-full">
						<UserAvatar user={user} size="4xl" />
					</div>

					<div className="flex items-center gap-2 pt-3">
						<UserProfileActionsDropdown user={user} variant="outline" />
						{user.isBlockedByAuthenticatedUser ? (
							<Button
								variant="outline"
								colorScheme="destructive"
								size="lg"
								disabled={userUnblockDialog.isPending}
								onClick={() =>
									userUnblockDialog.open({
										userId: user.id,
										username: user.username,
									})
								}
							>
								Unblock
							</Button>
						) : null}
						{isOwnProfile ? (
							<Button
								variant="outline"
								size="lg"
								onClick={() => void NiceModal.show(EditProfileModal, { user })}
							>
								Edit profile
							</Button>
						) : !user.hasBlockedAuthenticatedInUser &&
							!user.isBlockedByAuthenticatedUser ? (
							<FollowButton user={user} size={"lg"} />
						) : null}
					</div>
				</div>

				<div className="mt-3">
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						{user.fullName}
					</h2>
					<p className="text-muted-foreground">@{user.username}</p>
				</div>

				{user.bio ? (
					<p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
						{user.bio}
					</p>
				) : null}

				{user.hasBlockedAuthenticatedInUser ? null : (
					<>
						{joinedDate ? (
							<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
								<span className="flex items-center gap-1.5">
									<RiCalendar2Line className="size-4" />
									Joined {joinedDate}
								</span>
							</div>
						) : null}

						<div className="mt-4 flex flex-wrap gap-5 text-base text-muted-foreground">
							<UserProfileStatItem
								value={numberFormatter.format(user.postCount ?? 0)}
								label="Posts"
							/>
							<UserProfileStatItem
								value={numberFormatter.format(user.followersCount ?? 0)}
								label="Followers"
								onClick={() =>
									NiceModal.show(ListFollowersModal, {
										userId: user.id,
									})
								}
							/>
							<UserProfileStatItem
								value={numberFormatter.format(user.followingCount ?? 0)}
								label="Following"
								onClick={() =>
									NiceModal.show(ListFollowingModal, {
										userId: user.id,
									})
								}
							/>
						</div>
					</>
				)}
			</div>
		</section>
	);
}
export { UserProfileView };
