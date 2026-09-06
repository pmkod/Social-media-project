import { Configurations } from "../configurations";

type NotificationEventType =
	| "FOLLOW"
	| "POST_LIKE"
	| "COMMENT_LIKE"
	| "POST_COMMENT"
	| "COMMENT_REPLY";

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
}

export const notificationServiceClient = new NotificationServiceClient();
