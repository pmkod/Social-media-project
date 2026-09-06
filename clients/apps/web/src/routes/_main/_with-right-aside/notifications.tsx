import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { EmptyBlock } from "@/core/components/ui/empty-block.tsx";
import { ExceptionBlock } from "@/core/components/ui/exception-block.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { useIntersectionObserver } from "@/core/hooks/use-intersection-observer.ts";
import { groupNotifications } from "@/features/notification/common/notification.utils.ts";
import { NotificationItem } from "@/features/notification/list/notification-item.tsx";
import { NotificationListItemLoader } from "@/features/notification/list/notification-list-item-loader.tsx";
import { useNotifications } from "@/features/notification/list/use-notifications.ts";
import { useMarkNotificationsSeen } from "@/features/notification/mark-notifications-seen/use-mark-notifications-seen.ts";
import { useAuthenticatedUser } from "@/features/user/authenticated-user/use-authenticated-user.ts";

export const Route = createFileRoute("/_main/_with-right-aside/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
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
	const notifications = groupNotifications(
		data?.pages.flatMap((page) => page.notifications) ?? [],
	);
	const hasUnseenNotifications = notifications.some(
		(notification) => !notification.isSeen,
	);

	useEffect(() => {
		if (!isIntersecting || !hasNextPage || isFetchingNextPage) return;
		void fetchNextPage();
	}, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		if (!isSuccess || !isAuthenticatedUserLoaded || !hasUnseenNotifications)
			return;
		const timeoutId = window.setTimeout(() => {
			markNotificationsSeen();
		}, 3000);

		return () => window.clearTimeout(timeoutId);
	}, [
		hasUnseenNotifications,
		isSuccess,
		isAuthenticatedUserLoaded,
		markNotificationsSeen,
	]);

	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderTitle>Notifications</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<div className="border rounded-2xl overflow-hidden">
				{isLoading ? (
					<NotificationListItemLoader />
				) : isError ? (
					<ExceptionBlock
						title="Unable to load notifications"
						description="An error occurred while loading your notifications."
						onRefresh={() => void refetch()}
						isRefetching={isRefetching}
						bordered={false}
					/>
				) : notifications.length === 0 ? (
					<EmptyBlock
						title="No notifications yet"
						description="New likes, comments, replies, and followers will appear here."
						bordered={false}
						className="min-h-96"
					/>
				) : (
					<div className="divide-y divide-border">
						{notifications.map((notification) => (
							<NotificationItem
								key={notification.groupKey}
								notification={notification}
							/>
						))}
						{hasNextPage ? (
							<div ref={observerTargetRef}>
								<NotificationListItemLoader count={2} />
							</div>
						) : null}
					</div>
				)}
			</div>
		</MainContainer>
	);
}
