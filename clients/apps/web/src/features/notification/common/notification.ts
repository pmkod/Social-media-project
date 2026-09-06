import type { User } from "@/features/user/common/user.ts";

type NotificationEventType =
	| "FOLLOW"
	| "POST_LIKE"
	| "COMMENT_LIKE"
	| "POST_COMMENT"
	| "COMMENT_REPLY";

type NotificationRecord = {
	id: string;
	eventType: NotificationEventType;
	initiatorId: string;
	targetId: string | null;
	groupKey: string;
	initiator: User | null;
	isSeen: boolean;
	createdAt: string;
};

type NotificationGroup = {
	groupKey: string;
	eventType: NotificationEventType;
	targetId: string | null;
	initiatorCount: number;
	initiator: User | null;
	latestCreatedAt: string;
	isSeen: boolean;
};

type NotificationsCursor = {
	createdAt: string;
	id: string;
};

type NotificationsResponse = {
	notifications: NotificationRecord[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: NotificationsCursor | null;
	};
};

export type {
	NotificationEventType,
	NotificationGroup,
	NotificationRecord,
	NotificationsCursor,
	NotificationsResponse,
};
