import { RiLoader4Line } from "@remixicon/react";
import { type ComponentProps, useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button.tsx";
import { useFollowUser } from "../follow-user/use-follow-user.ts";
import { useUnfollowUser } from "../unfollow-user/use-unfollow-user.ts";
import type { User } from "./user.ts";

type FollowButtonProps = {
	user: Pick<User, "id" | "username" | "isFollowedByAuthenticatedUser">;
	size?: ComponentProps<typeof Button>["size"];
};

function FollowButton({ user, size = "sm" }: FollowButtonProps) {
	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();
	const isMutationPending = followUser.isPending || unfollowUser.isPending;

	const handleClick = () => {
		if (isMutationPending) return;

		if (user.isFollowedByAuthenticatedUser) {
			unfollowUser.mutate({ userId: user.id, username: user.username });
			return;
		}

		followUser.mutate({ userId: user.id });
	};

	return (
		<Button
			type="button"
			size={size}
			variant={user.isFollowedByAuthenticatedUser ? "outline" : "default"}
			disabled={isMutationPending}
			onClick={(event) => {
				event.stopPropagation();
				handleClick();
			}}
		>
			{isMutationPending ? (
				<RiLoader4Line className="size-4 animate-spin" />
			) : user.isFollowedByAuthenticatedUser ? (
				"Suivi"
			) : (
				"Suivre"
			)}
		</Button>
	);
}

export { FollowButton };
