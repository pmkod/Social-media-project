import type { NotificationEventType } from "../../../../../shared/notification.constants";
import { NotificationEventTypes } from "../../../../../shared/notification.constants";
import { NotificationGroupKeyBuilder } from "../../../../../shared/notification-group-key.builder";
import { Configurations } from "../configurations";

type CreateNotificationInput = {
	recipientId: string;
	initiatorId: string;
	eventType: NotificationEventType;
	targetId?: string;
	groupKey: string;
};

type RemoveNotificationInput = {
	eventType: NotificationEventType;
	recipientId: string;
	initiatorId: string;
	targetId?: string;
	groupKey: string;
};

class NotificationServiceClient {
	private readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = (
			baseUrl || Configurations.server.notificationServiceUrl
		).replace(/\/$/, "");
	}

	async createNotification(data: CreateNotificationInput): Promise<void> {
		try {
			const response = await fetch(`${this.baseUrl}/internal/notifications`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			if (!response.ok) {
				console.error(
					`[NotificationServiceClient] Failed to create notification, status: ${response.status}`,
				);
			}
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to create notification:",
				error,
			);
		}
	}

	async removeNotification(data: RemoveNotificationInput): Promise<void> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/notifications/remove`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				},
			);
			if (!response.ok) {
				console.error(
					`[NotificationServiceClient] Failed to remove notification, status: ${response.status}`,
				);
			}
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to remove notification:",
				error,
			);
		}
	}

	async removeNotificationsForPost(postId: string): Promise<void> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/notifications/remove-by-post`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ postId }),
				},
			);
			if (!response.ok) {
				console.error(
					`[NotificationServiceClient] Failed to remove post notifications, status: ${response.status}`,
				);
			}
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to remove post notifications:",
				error,
			);
		}
	}

	async removeNotificationsForComment(commentId: string): Promise<void> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/notifications/remove-by-comment`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ commentId }),
				},
			);
			if (!response.ok) {
				console.error(
					`[NotificationServiceClient] Failed to remove comment notifications, status: ${response.status}`,
				);
			}
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to remove comment notifications:",
				error,
			);
		}
	}
}

export { NotificationEventTypes, NotificationGroupKeyBuilder };
export const notificationServiceClient = new NotificationServiceClient();
