import { z } from "zod";

const environmentSchema = z.object({
	PORT: z.string().default("8002"),
	DATABASE_URL: z.string(),
	AUTH_SERVICE_URL: z.string().default("http://localhost:8001"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const environment = parsed.data;
