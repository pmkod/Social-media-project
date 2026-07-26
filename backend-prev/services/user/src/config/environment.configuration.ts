import { z } from "@hono/zod-openapi";

const environmentSchema = z.object({
	PORT: z.string().default("8082"),
	DATABASE_URL: z.string(),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const environment = parsed.data;
