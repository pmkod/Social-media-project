const NotificationEventTypes = {
	FOLLOW: "FOLLOW",
	POST_LIKE: "POST_LIKE",
	COMMENT_LIKE: "COMMENT_LIKE",
	POST_COMMENT: "POST_COMMENT",
	COMMENT_REPLY: "COMMENT_REPLY",
} as const;

const NotificationEventTypesValues = Object.values(NotificationEventTypes);

type NotificationEventType = (typeof NotificationEventTypesValues)[number];

export type { NotificationEventType };
export { NotificationEventTypes, NotificationEventTypesValues };
