import {
	RiChat1Line,
	RiHeartFill,
	RiMessage2Line,
	RiMessageLine,
	RiNotificationLine,
	RiUserAddLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/core/lib/utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";
import type {
	NotificationEventType,
	NotificationGroup,
} from "../common/notification.ts";
import { formatNotificationCreationDate } from "../common/notification.utils.ts";

const notificationCopy: Record<NotificationEventType, string> = {
	FOLLOW: "started following you",
	POST_LIKE: "liked your post",
	COMMENT_LIKE: "liked your comment",
	POST_COMMENT: "commented on your post",
	COMMENT_REPLY: "replied to your comment",
};

function NotificationIcon({ eventType }: { eventType: NotificationEventType }) {
	if (eventType === "POST_LIKE" || eventType === "COMMENT_LIKE") {
		return <RiHeartFill className="size-5 text-rose-500" />;
	}
	if (eventType === "FOLLOW") {
		return <RiUserAddLine className="size-5 text-blue-500" />;
	}
	if (eventType === "POST_COMMENT" || eventType === "COMMENT_REPLY") {
		return <RiChat1Line className="size-5 text-blue-500" />;
	}
	return <RiNotificationLine className="size-5 text-sky-500" />;
}

function NotificationInitiator({
	notification,
}: {
	notification: NotificationGroup;
}) {
	const initiatorLabel =
		notification.initiator?.fullName ||
		(notification.initiator
			? `@${notification.initiator.username}`
			: "Someone");
	const othersCount = Math.max(0, notification.initiatorCount - 1);

	return (
		<span>
			<span className="font-semibold text-foreground">{initiatorLabel}</span>
			{othersCount > 0
				? ` and ${othersCount} other ${othersCount === 1 ? "user" : "users"}`
				: ""}{" "}
			<span className="text-muted-foreground">
				{notificationCopy[notification.eventType]}
			</span>
		</span>
	);
}

type NotificationItemProps = {
	notification: NotificationGroup;
};

function NotificationItem({ notification }: NotificationItemProps) {
	const content = (
		<div
			className={cn(
				"flex gap-3 p-4 transition-colors hover:bg-muted/60",
				!notification.isSeen && "bg-sky-500/5",
			)}
		>
			<div className="shrink-0 pt-1">
				<NotificationIcon eventType={notification.eventType} />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2 text-sm">
					{notification.initiator ? (
						<>
							<UserProfileHoverCard user={notification.initiator}>
								<UserAvatar
									user={notification.initiator ?? undefined}
									size="sm"
								/>
							</UserProfileHoverCard>
							<UserProfileHoverCard user={notification.initiator}>
								<div>
									<NotificationInitiator notification={notification} />
								</div>
							</UserProfileHoverCard>
						</>
					) : null}
				</div>
				<span className="mt-1 block text-xs text-muted-foreground">
					{formatNotificationCreationDate(notification.latestCreatedAt)}
				</span>
			</div>
			{!notification.isSeen ? (
				<span
					className="mt-2 size-2 shrink-0 rounded-full bg-sky-500"
					aria-hidden="true"
				/>
			) : null}
		</div>
	);

	if (notification.eventType === "FOLLOW" && notification.initiator) {
		return (
			<div>
				<Link
					to="/$username"
					params={{ username: `@${notification.initiator.username}` }}
				>
					{content}
				</Link>
			</div>
		);
	}
	if (notification.eventType === "POST_LIKE" && notification.targetId) {
		return (
			<div>
				<Link to="/posts/$postId" params={{ postId: notification.targetId }}>
					{content}
				</Link>
			</div>
		);
	}
	return <div>{content}</div>;
}

export { NotificationItem };
