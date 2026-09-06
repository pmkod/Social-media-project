import { getEnv } from "../functions/env.functions";

const ServerConfiguration = {
	port: Number.parseInt(getEnv("PORT", "8001"), 10),
	notificationServiceUrl: getEnv(
		"NOTIFICATION_SERVICE_URL",
		"http://localhost:8004",
	),
	sessionServiceUrl: getEnv("SESSION_SERVICE_URL", "http://localhost:8006"),
};

export { ServerConfiguration };
