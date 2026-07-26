import { getEnv } from "../functions/env.functions";

const JwtConfiguration = {
	accessToken: {
		secretKey: getEnv("ACCESS_TOKEN_SECRET_KEY", "super-secret-access-key-social-media-2026"),
	},
} as const;

export { JwtConfiguration };
