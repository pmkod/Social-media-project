import { createFileRoute } from "@tanstack/react-router";
import { NotificationList } from "@/features/notification/notification-list";

export const Route = createFileRoute("/_main/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	return <NotificationList />;
}
