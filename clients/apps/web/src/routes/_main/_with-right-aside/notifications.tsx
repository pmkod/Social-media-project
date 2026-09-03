import { createFileRoute } from "@tanstack/react-router";
import {
	AppHeader,
	AppHeaderLeftPart,
	AppHeaderTitle,
} from "@/core/components/ui/app-header.tsx";
import { MainContainer } from "@/core/components/ui/main-container.tsx";
import { NotificationList } from "@/features/notification/notification-list";

export const Route = createFileRoute("/_main/_with-right-aside/notifications")({
	component: NotificationsPage,
});

function NotificationsPage() {
	return (
		<MainContainer>
			<AppHeader>
				<AppHeaderLeftPart>
					<AppHeaderTitle>Notifications</AppHeaderTitle>
				</AppHeaderLeftPart>
			</AppHeader>
			<NotificationList />
		</MainContainer>
	);
}
