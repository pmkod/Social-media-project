import { getEnv } from "../functions/env.functions";

const ServerConfiguration = {
	port: Number.parseInt(getEnv("PORT", "8004"), 10),
	userServiceUrl: getEnv("USER_SERVICE_URL", "http://localhost:8001"),
};

export { ServerConfiguration };
