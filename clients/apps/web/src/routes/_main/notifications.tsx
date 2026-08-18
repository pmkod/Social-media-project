import { createFileRoute } from "@tanstack/react-router";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { NotificationList } from "@/features/notification/notification-list";

export const Route = createFileRoute("/_main/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	return (
		<MainContainer>
			<NotificationList />
		</MainContainer>
	);
}
