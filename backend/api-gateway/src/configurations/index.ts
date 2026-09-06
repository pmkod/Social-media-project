import { CorsConfiguration } from "./cors.configuration";
import { EnvironmentConfiguration } from "./environment.configuration";
import { ServerConfiguration } from "./server.configuration";
import { SessionConfiguration } from "./session.configuration";

const Configurations = {
	cors: CorsConfiguration,
	environment: EnvironmentConfiguration,
	server: ServerConfiguration,
	session: SessionConfiguration,
};

export { Configurations };
