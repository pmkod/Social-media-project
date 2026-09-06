import { getEnv } from "../functions/env.functions";

const SessionConfiguration = {
	serviceUrl: getEnv("SESSION_SERVICE_URL", "http://localhost:8006"),
};

export { SessionConfiguration };
