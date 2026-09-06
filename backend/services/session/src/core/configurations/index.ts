import { EnvironmentConfiguration } from "./environment.configuration";
import { RedisConfiguration } from "./redis.configuration";
import { ServerConfiguration } from "./server.configuration";

const Configurations = {
	environment: EnvironmentConfiguration,
	redis: RedisConfiguration,
	server: ServerConfiguration,
};

export { Configurations };
