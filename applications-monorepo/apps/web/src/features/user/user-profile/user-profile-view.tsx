import { RiCalendar2Line } from "@remixicon/react";
import { Button } from "@/core/components/ui/button";
import { MediaPreviewModal } from "@/core/components/ui/media-preview-modal.tsx";
import NiceModal from "@/core/components/ui/nice-modal.tsx";
import { buildImageUrl } from "@/features/post/post-media.functions";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { FollowButton } from "@/features/user/common/follow-button.tsx";
import { EditProfileModal } from "@/features/user/edit-profile/edit-profile.modal.tsx";
import { ListFollowersModal } from "@/features/user/list-followers/list-followers.modal.tsx";
import { ListFollowingModal } from "@/features/user/list-following/list-following.modal.tsx";
import { UnblockUserAlertDialog } from "@/features/user/unblock-user/unblock-user-alert-dialog.tsx";
import { UserProfileActionsDropdown } from "@/features/user/user-profile/user-profile-actions-dropdown.tsx";
import { UserProfileStatItem } from "@/features/user/user-profile/user-profile-stat-item";
import * as m from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime.js";
import { useAuthenticatedUser } from "../authenticated-user/use-authenticated-user";
import type { User } from "../common/user";

type UserProfileViewProps = {
	user: User;
};

function UserProfileView({ user }: UserProfileViewProps) {
	const { data } = useAuthenticatedUser();
	const authenticatedUser = data?.user;
	const locale = getLocale();
	const numberFormatter = new Intl.NumberFormat(locale, {
		notation: "compact",
	});
	const joinedDateFormatter = new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
	});

	const joinedDate = user.createdAt
		? joinedDateFormatter.format(new Date(user.createdAt))
		: null;

	const isOwnProfile = authenticatedUser?.id === user.id;

	const coverPictureFullUrl =
		buildImageUrl(
			user.bestQualityCoverPictureFile?.filename ??
				user.lowQualityCoverPictureFile?.filename,
		) || null;

	const coverPictureSrc =
		buildImageUrl(
			user.lowQualityCoverPictureFile?.filename ??
				user.bestQualityCoverPictureFile?.filename,
		) || null;

	const profilePictureFullUrl =
		buildImageUrl(
			user.bestQualityProfilePictureFile?.filename ??
				user.lowQualityProfilePictureFile?.filename,
		) || null;

	const handleOpenCoverPicture = () => {
		const url = coverPictureFullUrl ?? coverPictureSrc;
		if (!url) return;
		void NiceModal.show(MediaPreviewModal, {
			items: [
				{
					url,
					type: "image",
					name: m.profile_cover_preview(),
				},
			],
			initialIndex: 0,
		});
	};

	const handleOpenProfilePicture = () => {
		if (!profilePictureFullUrl) return;
		void NiceModal.show(MediaPreviewModal, {
			items: [
				{
					url: profilePictureFullUrl,
					type: "image",
					name: user.fullName,
				},
			],
			initialIndex: 0,
		});
	};

	return (
		<section className="border-x border-t rounded-t-xl overflow-hidden">
			<div className="h-48 sm:h-56 bg-muted">
				{coverPictureSrc ? (
					<button
						type="button"
						onClick={handleOpenCoverPicture}
						className="block h-full w-full cursor-pointer overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-label={m.profile_cover_preview()}
					>
						<img
							src={coverPictureSrc}
							alt={m.profile_cover_alt({ name: user.fullName })}
							className="h-full w-full object-cover"
						/>
					</button>
				) : null}
			</div>

			<div className="px-4 md:px-5 pb-3">
				<div className="flex items-start justify-between">
					<div className="-mt-20 shrink-0 border-4 border-background rounded-full bg-background">
						{profilePictureFullUrl ? (
							<button
								type="button"
								onClick={handleOpenProfilePicture}
								className="block rounded-full cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								aria-label={m.profile_preview()}
							>
								<UserAvatar user={user} size="4xl" />
							</button>
						) : (
							<UserAvatar user={user} size="4xl" />
						)}
					</div>

					<div className="flex items-center gap-2 pt-3">
						<UserProfileActionsDropdown user={user} variant="outline" />
						{user.isBlockedByAuthenticatedUser ? (
							<Button
								variant="outline"
								colorScheme="destructive"
								size="lg"
								onClick={() =>
									void NiceModal.show(UnblockUserAlertDialog, {
										user,
									})
								}
							>
								{m.discussion_unblock()}
							</Button>
						) : null}
						{isOwnProfile ? (
							<Button
								variant="outline"
								size="lg"
								onClick={() => void NiceModal.show(EditProfileModal, { user })}
							>
								{m.profile_edit()}
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
									{m.profile_joined({ date: joinedDate })}
								</span>
							</div>
						) : null}

						<div className="mt-4 flex flex-wrap gap-5 text-base text-muted-foreground">
							<UserProfileStatItem
								value={numberFormatter.format(user.postCount ?? 0)}
								label={m.profile_posts()}
							/>
							<UserProfileStatItem
								value={numberFormatter.format(user.followersCount ?? 0)}
								label={m.followers()}
								onClick={() =>
									NiceModal.show(ListFollowersModal, {
										userId: user.id,
									})
								}
							/>
							<UserProfileStatItem
								value={numberFormatter.format(user.followingCount ?? 0)}
								label={m.following_count()}
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
