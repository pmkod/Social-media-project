import { getEnv } from "../functions/env.functions";

const CorsConfiguration = {
	origin: getEnv("CORS_ORIGIN", "*"),
};

export { CorsConfiguration };
