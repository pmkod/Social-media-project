import { getEnv } from "../functions/env.functions";

const ServerConfiguration = {
	port: Number.parseInt(getEnv("PORT", "8003"), 10),
	contentServiceUrl: getEnv("CONTENT_SERVICE_URL", "http://localhost:8002"),
	userServiceUrl: getEnv("USER_SERVICE_URL", "http://localhost:8001"),
};

export { ServerConfiguration };
