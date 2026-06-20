import { z } from "zod";

const environmentSchema = z.object({
	PORT: z.string().default("8081"),
	DATABASE_URL: z.string(),
	USER_SERVICE_URL: z.string().default("http://localhost:8082"),
	JWT_SECRET: z.string(),
	JWT_ACCESS_EXPIRATION: z.string().default("15m"),
	JWT_REFRESH_EXPIRATION: z.string().default("7d"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const environment = parsed.data;
