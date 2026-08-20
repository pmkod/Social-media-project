import { EnvironmentConfiguration } from "./environment.configuration";
import { JwtConfiguration } from "./jwt.configuration";
import { ServerConfiguration } from "./server.configuration";
import { StorageConfiguration } from "./storage.configuration";

const Configurations = {
	environment: EnvironmentConfiguration,
	jwt: JwtConfiguration,
	server: ServerConfiguration,
	storage: StorageConfiguration,
};

export { Configurations };
