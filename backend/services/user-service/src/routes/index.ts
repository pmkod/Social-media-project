import { getMeRoute } from "./get-me.route";
import { internalUsersRoutes } from "./internal";

export const usersRoutes = [getMeRoute, ...internalUsersRoutes];
