import { RiLoader4Line } from "@remixicon/react";
import { type ComponentProps, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { useFollowUser } from "../follow-user/use-follow-user.ts";
import { useUnfollowUser } from "../unfollow-user/use-unfollow-user.ts";
import type { User } from "./user.ts";

type FollowButtonProps = {
	user: Pick<User, "id" | "isFollowedByAuthenticatedUser">;
	size?: ComponentProps<typeof Button>["size"];
	className?: string;
};

function FollowButton({ user, size = "sm", className }: FollowButtonProps) {
	const [isHovered, setIsHovered] = useState(false);
	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();
	const isMutationPending = followUser.isPending || unfollowUser.isPending;
	const showUnfollow =
		user.isFollowedByAuthenticatedUser && isHovered && !isMutationPending;

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
			className={className}
			variant={user.isFollowedByAuthenticatedUser ? "outline" : "default"}
			colorScheme={showUnfollow ? "destructive" : "primary"}
			disabled={isMutationPending}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={(event) => {
				event.stopPropagation();
				handleClick();
			}}
		>
			{isMutationPending ? (
				<RiLoader4Line className="size-4 animate-spin" />
			) : showUnfollow ? (
				"Unfollow"
			) : user.isFollowedByAuthenticatedUser ? (
				"Suivi"
			) : (
				"Suivre"
			)}
		</Button>
	);
}

export { FollowButton };
