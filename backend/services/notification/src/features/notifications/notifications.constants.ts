const NotificationsRoutesTag = "Notifications";

const NotificationEventTypes = [
	"FOLLOW",
	"POST_LIKE",
	"COMMENT_LIKE",
	"POST_COMMENT",
	"COMMENT_REPLY",
] as const;

export { NotificationEventTypes, NotificationsRoutesTag };
