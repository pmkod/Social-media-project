import { getMeRoute } from "./get-me.route";
import { getUserByIdRoute } from "./get-user-by-id.route";
import { updateProfileRoute } from "./update-profile.route";

const userRoutes = [
	getMeRoute,
	getUserByIdRoute,
	updateProfileRoute,
];

export { userRoutes };
