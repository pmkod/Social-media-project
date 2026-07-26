import { createUserRoute } from "./create-user.route";
import { getUserByEmailRoute } from "./get-user-by-email.route";
import { getUserByIdRoute } from "./get-user-by-id.route";
import { getUserByUsernameRoute } from "./get-user-by-username.route";
import { validateCredentialsRoute } from "./validate-credentials.route";

export const internalUsersRoutes = [
	validateCredentialsRoute,
	getUserByEmailRoute,
	getUserByUsernameRoute,
	getUserByIdRoute,
	createUserRoute,
];
