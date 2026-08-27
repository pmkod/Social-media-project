import { getEnv } from "../functions/env.functions";

const ServerConfiguration = {
	port: Number.parseInt(getEnv("PORT", "8002"), 10),
	userServiceUrl: getEnv("USER_SERVICE_URL", "http://localhost:8001"),
	notificationServiceUrl: getEnv(
		"NOTIFICATION_SERVICE_URL",
		"http://localhost:8004",
	),
};

export { ServerConfiguration };
