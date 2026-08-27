import { createNotificationRoute } from "./create-notification.route";
import { getNotificationsRoute } from "./get-notifications.route";
import { markNotificationsSeenRoute } from "./mark-notifications-seen.route";
import { removeNotificationRoute } from "./remove-notification.route";
import { removePostNotificationsRoute } from "./remove-post-notifications.route";

const notificationsRoutes = [
	getNotificationsRoute,
	markNotificationsSeenRoute,
	createNotificationRoute,
	removeNotificationRoute,
	removePostNotificationsRoute,
];

export { notificationsRoutes };
