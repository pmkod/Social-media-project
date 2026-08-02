import { getEnv } from "../functions/env.functions";

const JwtConfiguration = {
	accessToken: {
		secretKey: getEnv(
			"ACCESS_TOKEN_SECRET_KEY",
			"super-secret-access-key-social-media-2026",
		),
		durationInSec: Number.parseInt(
			getEnv("ACCESS_TOKEN_EXPIRATION_SEC", "900000000000000"),
			10,
		),
	},
	refreshToken: {
		durationInSec: Number.parseInt(
			getEnv("REFRESH_TOKEN_EXPIRATION_SEC", "604800"),
			10,
		),
	},
} as const;

export { JwtConfiguration };
