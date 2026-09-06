import type { NotificationGroup, NotificationRecord } from "./notification.ts";

type NotificationGroupAccumulator = NotificationGroup & {
	initiatorIds: Set<string>;
	latestNotificationId: string;
};

function compareNotificationRecency(
	a: Pick<NotificationRecord, "id" | "createdAt">,
	b: Pick<NotificationRecord, "id" | "createdAt">,
): number {
	const createdAtDifference =
		new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
	if (createdAtDifference !== 0) return createdAtDifference;
	if (a.id === b.id) return 0;
	return a.id > b.id ? 1 : -1;
}

function getNotificationGroupKey(notification: NotificationRecord): string {
	return notification.groupKey;
}

function groupNotifications(
	notifications: NotificationRecord[],
): NotificationGroup[] {
	const groups = new Map<string, NotificationGroupAccumulator>();

	for (const notification of notifications) {
		const key = getNotificationGroupKey(notification);
		const group = groups.get(key);

		if (!group) {
			groups.set(key, {
				groupKey: key,
				eventType: notification.eventType,
				targetId: notification.targetId,
				initiatorCount: 1,
				initiator: notification.initiator,
				latestCreatedAt: notification.createdAt,
				isSeen: notification.isSeen,
				initiatorIds: new Set([notification.initiatorId]),
				latestNotificationId: notification.id,
			});
			continue;
		}

		group.initiatorIds.add(notification.initiatorId);
		group.isSeen = group.isSeen && notification.isSeen;

		if (
			compareNotificationRecency(notification, {
				id: group.latestNotificationId,
				createdAt: group.latestCreatedAt,
			}) > 0
		) {
			group.targetId = notification.targetId;
			group.initiator = notification.initiator;
			group.latestCreatedAt = notification.createdAt;
			group.latestNotificationId = notification.id;
		}
	}

	return Array.from(groups.values())
		.sort((a, b) =>
			compareNotificationRecency(
				{
					id: b.latestNotificationId,
					createdAt: b.latestCreatedAt,
				},
				{
					id: a.latestNotificationId,
					createdAt: a.latestCreatedAt,
				},
			),
		)
		.map(({ initiatorIds, latestNotificationId, ...group }) => ({
			...group,
			initiatorCount: initiatorIds.size,
		}));
}

/**
 * Formats a post creation date for display in the UI (feeds, cards, lists).
 * Returns relative time for recent posts ("Just now", "5 min", "2 hr", "3 d")
 * or a clean localized date for older posts ("Aug 16", "Aug 16, 2025").
 */
export function formatNotificationCreationDate(
	dateInput: string | Date | number | null | undefined,
): string {
	if (!dateInput) return "";

	const date =
		typeof dateInput === "string" || typeof dateInput === "number"
			? new Date(dateInput)
			: dateInput;

	if (Number.isNaN(date.getTime())) {
		return typeof dateInput === "string" ? dateInput : "";
	}

	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	// Handling future dates or barely created items
	if (diffInSeconds < 60) {
		return "Just now";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} min`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hr`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} d`;
	}

	// For older posts
	const isCurrentYear = date.getFullYear() === now.getFullYear();
	return date.toLocaleDateString("en-US", {
		day: "numeric",
		month: "short",
		year: isCurrentYear ? undefined : "numeric",
	});
}

export { groupNotifications };
