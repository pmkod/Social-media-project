export const NotificationEventTypes = {
	FOLLOW: "FOLLOW",
	POST_LIKE: "POST_LIKE",
	COMMENT_LIKE: "COMMENT_LIKE",
	POST_COMMENT: "POST_COMMENT",
	COMMENT_REPLY: "COMMENT_REPLY",
} as const;

export const NotificationEventTypesValues = Object.values(NotificationEventTypes);
export type NotificationEventType = (typeof NotificationEventTypesValues)[number];
