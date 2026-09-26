import type { NotificationEventType } from "../../../../../shared/notification.constants";
import { NotificationEventTypes } from "../../../../../shared/notification.constants";
import { NotificationGroupKeyBuilder } from "../../../../../shared/notification-group-key.builder";
import { Configurations } from "../configurations";
import { internalHttpClient } from "../http-clients/internal.http-client";

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

const notificationServiceHttpClient = internalHttpClient.extend({
	prefix: Configurations.server.notificationServiceUrl,
});

const notificationServiceClient = {
	async createNotification(data: CreateNotificationInput): Promise<void> {
		try {
			await notificationServiceHttpClient.post(
				"internal/notification/create-notification",
				{ json: data },
			);
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to create notification:",
				error,
			);
		}
	},

	async removeNotification(data: RemoveNotificationInput): Promise<void> {
		try {
			await notificationServiceHttpClient.post(
				"internal/notification/remove-notification",
				{ json: data },
			);
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to remove notification:",
				error,
			);
		}
	},

	async removeNotificationsForPost(postId: string): Promise<void> {
		try {
			await notificationServiceHttpClient.post(
				"internal/notification/remove-post-notifications",
				{ json: { postId } },
			);
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to remove post notifications:",
				error,
			);
		}
	},

	async removeNotificationForComment(commentId: string): Promise<void> {
		try {
			await notificationServiceHttpClient.post(
				"internal/notification/remove-comment-notifications",
				{ json: { commentId } },
			);
		} catch (error) {
			console.error(
				"[NotificationServiceClient] Failed to remove comment notification:",
				error,
			);
		}
	},
};

export {
	NotificationEventTypes,
	NotificationGroupKeyBuilder,
	notificationServiceClient,
};
