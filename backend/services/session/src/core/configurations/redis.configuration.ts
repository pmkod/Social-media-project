import { getEnv } from "../functions/env.functions";

const RedisConfiguration = {
	url: getEnv("REDIS_URL", "redis://localhost:6379/0"),
	keyPrefix: getEnv("REDIS_KEY_PREFIX", "social-media"),
};

export { RedisConfiguration };
