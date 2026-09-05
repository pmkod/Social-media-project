import {
	RiHeartFill,
	RiNotificationLine,
	RiUserAddLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/core/lib/utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type {
	NotificationEventType,
	NotificationGroup,
} from "../common/notification.ts";
import { formatNotificationCreationDate } from "../common/notification.utils.ts";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";

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
		return <RiUserAddLine className="size-5 text-blue-500" />;
	}
	return <RiNotificationLine className="size-5 text-sky-500" />;
}

function NotificationActor({
	notification,
}: {
	notification: NotificationGroup;
}) {
	const actorLabel =
		notification.actor?.fullName ||
		(notification.actor ? `@${notification.actor.username}` : "Someone");
	const othersCount = Math.max(0, notification.actorCount - 1);

	return (
		<span>
			<span className="font-semibold text-foreground">{actorLabel}</span>
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
					{notification.actor ? (
						<>
							<UserProfileHoverCard user={notification.actor}>
								<UserAvatar user={notification.actor ?? undefined} size="sm" />
							</UserProfileHoverCard>
							<UserProfileHoverCard user={notification.actor}>
								<div>
									<NotificationActor notification={notification} />
								</div>
							</UserProfileHoverCard>
						</>
					) : null}
				</div>
				{notification.contentPreview ? (
					<div className="mt-2 border border-border/20 p-2.5 rounded-xl">
						<p className="line-clamp-2 text-sm text-muted-foreground">
							{notification.contentPreview}
						</p>
					</div>
				) : null}
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

	if (notification.eventType === "FOLLOW" && notification.actor) {
		return (
			<Link
				to="/$username"
				params={{ username: `@${notification.actor.username}` }}
			>
				{content}
			</Link>
		);
	}
	if (notification.postId) {
		return (
			<Link to="/posts/$postId" params={{ postId: notification.postId }}>
				{content}
			</Link>
		);
	}
	return content;
}

export { NotificationItem };
