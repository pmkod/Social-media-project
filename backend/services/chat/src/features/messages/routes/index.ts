import { createMessageRoute } from "./create-message.route";
import { deleteMessageRoute } from "./delete-message.route";
import { getMessagesRoute } from "./get-messages.route";
import { getMessageImageRoute } from "./get-message-image.route";
import { updateMessageRoute } from "./update-message.route";

const messagesRoutes = [
	getMessagesRoute,
	getMessageImageRoute,
	createMessageRoute,
	updateMessageRoute,
	deleteMessageRoute,
];

export { messagesRoutes };
