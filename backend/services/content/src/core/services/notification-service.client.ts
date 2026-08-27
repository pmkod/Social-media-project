import { Configurations } from "../configurations";

type NotificationEventType =
	| "FOLLOW"
	| "POST_LIKE"
	| "POST_COMMENT"
	| "COMMENT_REPLY";

type CreateNotificationInput = {
	recipientId: string;
	actorId: string;
	eventType: NotificationEventType;
	entityId: string;
	sourceId: string;
	postId?: string;
	commentId?: string;
	contentPreview?: string;
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
				body: JSON.stringify({
					...data,
					contentPreview:
						data.contentPreview?.trim().slice(0, 280) || undefined,
				}),
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

	async removeNotification(
		eventType: NotificationEventType,
		sourceId: string,
	): Promise<void> {
		try {
			const response = await fetch(
				`${this.baseUrl}/internal/notifications/remove`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ eventType, sourceId }),
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
}

export const notificationServiceClient = new NotificationServiceClient();
