import type { User } from "@/features/user/common/user";
import type { NotificationEventType } from "./notification.constants";

export type NotificationRecord = {
	id: string;
	eventType: NotificationEventType;
	initiatorId: string;
	targetId: string | null;
	groupKey: string;
	initiator: User | null;
	isSeen: boolean;
	createdAt: string;
};

export type NotificationsCursor = {
	createdAt: string;
	id: string;
};

export type NotificationsResponse = {
	notifications: NotificationRecord[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: NotificationsCursor | null;
	};
};
