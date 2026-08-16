import { getMeRoute } from "./get-me.route";
import { getUserByIdRoute } from "./get-user-by-id.route";
import { getUsersBatchRoute } from "./get-users-batch.route";
import { updateProfileRoute } from "./update-profile.route";

const userRoutes = [
	getMeRoute,
	getUserByIdRoute,
	getUsersBatchRoute,
	updateProfileRoute,
];

export { userRoutes };
