import { CorsConfiguration } from "./cors.configuration";
import { EnvironmentConfiguration } from "./environment.configuration";
import { JwtConfiguration } from "./jwt.configuration";
import { ServerConfiguration } from "./server.configuration";

const Configurations = {
	cors: CorsConfiguration,
	environment: EnvironmentConfiguration,
	jwt: JwtConfiguration,
	server: ServerConfiguration,
};

export { Configurations };
