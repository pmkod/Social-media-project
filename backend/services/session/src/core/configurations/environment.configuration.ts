import { getEnv } from "../functions/env.functions";

const EnvironmentConfiguration = {
	nodeEnv: getEnv("NODE_ENV", "development"),
};

export { EnvironmentConfiguration };
