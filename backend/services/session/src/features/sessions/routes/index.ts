import { createSessionRoute } from "./create-session.route";
import { disableSessionRoute } from "./disable-session.route";
import { getAllActiveSessionsRoute } from "./get-all-active-sessions.route";
import { getSessionRoute } from "./get-session.route";
import { logoutOtherSessionsRoute } from "./logout-other-sessions.route";
import { verifySessionRoute } from "./verify-session.route";

const sessionsRoutes = [
	createSessionRoute,
	getAllActiveSessionsRoute,
	logoutOtherSessionsRoute,
	verifySessionRoute,
	getSessionRoute,
	disableSessionRoute,
];

export { sessionsRoutes };
