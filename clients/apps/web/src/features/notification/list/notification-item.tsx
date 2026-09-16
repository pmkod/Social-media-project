import {
	RiChat1Line,
	RiHeartFill,
	RiNotificationLine,
	RiUserAddLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/core/lib/utils.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import { UserProfileHoverCard } from "@/features/user/user-profile/user-profile-hover-card.tsx";
import * as m from "@/paraglide/messages.js";
import { NotificationEventTypes } from "../common/notification.constants.ts";
import type {
	NotificationEventType,
	NotificationGroup,
} from "../common/notification.ts";
import {
	formatNotificationCreationDate,
	getNotificationPostId,
} from "../common/notification.utils.ts";

const getNotificationCopy = (eventType: NotificationEventType) => {
	if (eventType === NotificationEventTypes.FOLLOW)
		return m.notification_follow();
	if (eventType === NotificationEventTypes.POST_LIKE)
		return m.notification_post_like();
	if (eventType === NotificationEventTypes.COMMENT_LIKE)
		return m.notification_comment_like();
	if (eventType === NotificationEventTypes.POST_COMMENT)
		return m.notification_post_comment();
	return m.notification_comment_reply();
};

function NotificationIcon({ eventType }: { eventType: NotificationEventType }) {
	if (
		eventType === NotificationEventTypes.POST_LIKE ||
		eventType === NotificationEventTypes.COMMENT_LIKE
	) {
		return <RiHeartFill className="size-5 text-rose-500" />;
	}
	if (eventType === NotificationEventTypes.FOLLOW) {
		return <RiUserAddLine className="size-5 text-blue-500" />;
	}
	if (
		eventType === NotificationEventTypes.POST_COMMENT ||
		eventType === NotificationEventTypes.COMMENT_REPLY
	) {
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
			: m.notification_someone());
	const othersCount = Math.max(0, notification.initiatorCount - 1);

	return (
		<span>
			{notification.initiator ? (
				<UserProfileHoverCard user={notification.initiator}>
					<span className="font-semibold text-foreground">
						{initiatorLabel}
					</span>
				</UserProfileHoverCard>
			) : (
				<span className="font-semibold text-foreground">{initiatorLabel}</span>
			)}
			{othersCount > 0
				? ` ${
						othersCount === 1
							? m.notification_and_one_other({ count: othersCount })
							: m.notification_and_others({ count: othersCount })
					}`
				: ""}{" "}
			<span className="text-muted-foreground">
				{getNotificationCopy(notification.eventType)}
			</span>
		</span>
	);
}

type NotificationItemProps = {
	notification: NotificationGroup;
};

function NotificationItem({ notification }: NotificationItemProps) {
	const postId = getNotificationPostId(notification);
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
							<UserAvatar user={notification.initiator} size="sm" />
							<div>
								<NotificationInitiator notification={notification} />
							</div>
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

	if (
		notification.eventType === NotificationEventTypes.FOLLOW &&
		notification.initiator
	) {
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
	if (postId) {
		return (
			<div>
				<Link to="/posts/$postId" params={{ postId }}>
					{content}
				</Link>
			</div>
		);
	}
	return <div>{content}</div>;
}

export { NotificationItem };
