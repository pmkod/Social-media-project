import {
	RiChat3Line,
	RiHeartFill,
	RiNotification3Line,
	RiUserAddLine,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { cn } from "@/core/lib/utils.ts";
import { formatPostCreationDate } from "@/features/post/common/post.utils.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";
import { UserAvatar } from "@/features/user/common/components/user-avatar.tsx";
import type {
	NotificationEventType,
	NotificationGroup,
} from "./notification.ts";
import { useMarkNotificationsSeen } from "./use-mark-notifications-seen.ts";
import { useNotifications } from "./use-notifications.ts";

const notificationCopy: Record<NotificationEventType, string> = {
	FOLLOW: "started following you",
	POST_LIKE: "liked your post",
	POST_COMMENT: "commented on your post",
	COMMENT_REPLY: "replied to your comment",
};

const notificationLoaderIds = [
	"notification-loader-1",
	"notification-loader-2",
	"notification-loader-3",
	"notification-loader-4",
	"notification-loader-5",
];

function NotificationIcon({ eventType }: { eventType: NotificationEventType }) {
	if (eventType === "POST_LIKE") {
		return <RiHeartFill className="size-5 text-rose-500" />;
	}
	if (eventType === "FOLLOW") {
		return <RiUserAddLine className="size-5 text-indigo-500" />;
	}
	return <RiChat3Line className="size-5 text-sky-500" />;
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

function NotificationItem({
	notification,
}: {
	notification: NotificationGroup;
}) {
	const content = (
		<div
			className={cn(
				"flex gap-3 p-4 transition-colors hover:bg-accent/60",
				!notification.isSeen && "bg-sky-500/5",
			)}
		>
			<div className="shrink-0 pt-1">
				<NotificationIcon eventType={notification.eventType} />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2 text-sm">
					<UserAvatar user={notification.actor ?? undefined} size="sm" />
					<div className="min-w-0">
						<NotificationActor notification={notification} />
					</div>
				</div>
				{notification.contentPreview ? (
					<p className="mt-2 line-clamp-2 rounded-xl border border-border bg-muted/60 p-2.5 text-sm text-muted-foreground">
						{notification.contentPreview}
					</p>
				) : null}
				<span className="mt-1 block text-xs text-muted-foreground">
					{formatPostCreationDate(notification.latestCreatedAt)}
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

function NotificationListLoader({ count = 5 }: { count?: number }) {
	return (
		<div className="divide-y divide-border">
			{notificationLoaderIds.slice(0, count).map((loaderId) => (
				<div key={loaderId} className="flex animate-pulse gap-3 p-4">
					<div className="size-5 rounded bg-muted" />
					<div className="flex-1 space-y-3">
						<div className="h-8 w-2/3 rounded bg-muted" />
						<div className="h-12 rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}

export function NotificationList() {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isError,
		isFetchingNextPage,
		isLoading,
		isRefetching,
		isSuccess,
		refetch,
	} = useNotifications();
	const { isSuccess: isAuthenticatedUserLoaded } = useAuthenticatedUser();
	const { mutate: markNotificationsSeen } = useMarkNotificationsSeen();
	const { ref: observerTargetRef, isIntersecting } = useIntersectionObserver({
		rootMargin: "100px",
	});
	const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

	useEffect(() => {
		if (!isIntersecting || !hasNextPage || isFetchingNextPage) return;
		void fetchNextPage();
	}, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		if (!isSuccess || !isAuthenticatedUserLoaded) return;
		const timeoutId = window.setTimeout(() => {
			markNotificationsSeen();
		}, 3000);

		return () => window.clearTimeout(timeoutId);
	}, [isSuccess, isAuthenticatedUserLoaded, markNotificationsSeen]);

	return (
		<div className="min-h-screen">
			<div className="border-b border-border p-4">
				<h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
					<RiNotification3Line className="size-6 text-sky-500" />
					<span>Notifications</span>
				</h1>
			</div>

			{isLoading ? (
				<NotificationListLoader />
			) : isError ? (
				<ExceptionBlock
					title="Unable to load notifications"
					description="An error occurred while loading your notifications."
					onRefresh={() => void refetch()}
					isRefetching={isRefetching}
					borderless
				/>
			) : notifications.length === 0 ? (
				<EmptyBlock
					title="No notifications yet"
					description="New likes, comments, replies, and followers will appear here."
					borderless
				/>
			) : (
				<div className="divide-y divide-border">
					{notifications.map((notification) => (
						<NotificationItem
							key={notification.key}
							notification={notification}
						/>
					))}
					{hasNextPage ? (
						<div ref={observerTargetRef}>
							<NotificationListLoader count={2} />
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
