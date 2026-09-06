import { Configurations } from "@/core/configurations";
import { createClient } from "redis";

const redis = createClient({ url: Configurations.redis.url });

redis.on("error", (error) => {
	console.error("[SESSION SERVICE REDIS ERROR]", error);
});

let connectionPromise: ReturnType<typeof redis.connect> | undefined;

const getRedis = async () => {
	if (!redis.isOpen) {
		connectionPromise ??= redis.connect().finally(() => {
			connectionPromise = undefined;
		});
		await connectionPromise;
	}

	return redis;
};

export { getRedis, redis };
