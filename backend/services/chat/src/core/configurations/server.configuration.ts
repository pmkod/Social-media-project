import { getEnv } from "../functions/env.functions";

const ServerConfiguration = {
	port: Number.parseInt(getEnv("PORT", "8005"), 10),
	userServiceUrl: getEnv("USER_SERVICE_URL", "http://localhost:8001"),
};

export { ServerConfiguration };
