import type { User } from "@/features/user/common/user.ts";

type NotificationEventType =
	| "FOLLOW"
	| "POST_LIKE"
	| "POST_COMMENT"
	| "COMMENT_REPLY";

type NotificationGroup = {
	key: string;
	eventType: NotificationEventType;
	entityId: string;
	postId: string | null;
	commentId: string | null;
	contentPreview: string | null;
	actorCount: number;
	actor: User | null;
	latestCreatedAt: string;
	isSeen: boolean;
};

type NotificationsCursor = {
	createdAt: string;
	id: string;
};

type NotificationsResponse = {
	notifications: NotificationGroup[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: NotificationsCursor | null;
	};
};

export type {
	NotificationEventType,
	NotificationGroup,
	NotificationsCursor,
	NotificationsResponse,
};
