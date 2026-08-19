import { RiLoader4Line } from "@remixicon/react";
import { type ComponentProps, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { useFollowUser } from "../follow-user/use-follow-user.ts";
import { useUnfollowUser } from "../unfollow-user/use-unfollow-user.ts";
import type { User } from "./user.ts";

type FollowButtonProps = {
	user: Pick<
		User,
		| "id"
		| "isFollowedByAuthenticatedUser"
		| "isBlockedByAuthenticatedUser"
		| "hasBlockedAuthenticatedInUser"
	>;
	size?: ComponentProps<typeof Button>["size"];
};

function FollowButton({ user, size = "sm" }: FollowButtonProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [hasLeftSinceFollow, setHasLeftSinceFollow] = useState(
		() => user.isFollowedByAuthenticatedUser,
	);
	const [prevIsFollowed, setPrevIsFollowed] = useState(
		user.isFollowedByAuthenticatedUser,
	);

	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();
	const isMutationPending = followUser.isPending || unfollowUser.isPending;

	if (user.isFollowedByAuthenticatedUser !== prevIsFollowed) {
		setPrevIsFollowed(user.isFollowedByAuthenticatedUser);
		if (user.isFollowedByAuthenticatedUser) {
			setHasLeftSinceFollow(!isHovered);
		} else {
			setHasLeftSinceFollow(false);
		}
	}

	if (user.isBlockedByAuthenticatedUser || user.hasBlockedAuthenticatedInUser) {
		return null;
	}

	const showUnfollow =
		user.isFollowedByAuthenticatedUser &&
		isHovered &&
		hasLeftSinceFollow &&
		!isMutationPending;

	const handleClick = () => {
		if (isMutationPending) return;

		if (user.isFollowedByAuthenticatedUser) {
			unfollowUser.mutate({ userId: user.id });
			return;
		}

		followUser.mutate({ userId: user.id });
	};

	return (
		<Button
			type="button"
			size={size}
			variant={user.isFollowedByAuthenticatedUser ? "outline" : "default"}
			colorScheme={showUnfollow ? "destructive" : "primary"}
			aria-busy={isMutationPending}
			aria-disabled={isMutationPending}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				if (user.isFollowedByAuthenticatedUser) {
					setHasLeftSinceFollow(true);
				}
			}}
			onClick={(event) => {
				event.stopPropagation();
				event.preventDefault();
				handleClick();
			}}
		>
			{isMutationPending ? (
				<RiLoader4Line className="size-4 animate-spin" />
			) : showUnfollow ? (
				"Unfollow"
			) : user.isFollowedByAuthenticatedUser ? (
				"Following"
			) : (
				"Follow"
			)}
		</Button>
	);
}

export { FollowButton };
