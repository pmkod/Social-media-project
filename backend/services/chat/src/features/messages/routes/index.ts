import { createMessageRoute } from "./create-message.route";
import { deleteMessageRoute } from "./delete-message.route";
import { getMessagesRoute } from "./get-messages.route";
import { updateMessageRoute } from "./update-message.route";

const messagesRoutes = [
	getMessagesRoute,
	createMessageRoute,
	updateMessageRoute,
	deleteMessageRoute,
];

export { messagesRoutes };
