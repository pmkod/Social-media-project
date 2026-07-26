import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { comparePasswordToHash } from "@/functions/password.functions";
import { ValidateCredentialsBodySchema } from "@/schemas/users.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/internal/users/validate-credentials",
	summary: "Validate user credentials",
	request: {
		body: {
			content: {
				"application/json": {
					schema: ValidateCredentialsBodySchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Credentials valid",
		},
	},
});

const validateCredentialsRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const body = c.req.valid("json");

		const user = await prisma.user.findUnique({
			where: { email: body.email },
		});

		if (!user || !user.active) {
			throw new AppError({
				message: "Invalid credentials",
				code: ErrorCodes.INVALID_CREDENTIALS,
				statusCode: 401,
			});
		}

		const isPasswordValid = await comparePasswordToHash({
			password: body.password,
			hash: user.passwordHash,
		});

		if (!isPasswordValid) {
			throw new AppError({
				message: "Invalid credentials",
				code: ErrorCodes.INVALID_CREDENTIALS,
				statusCode: 401,
			});
		}

		return c.json(
			{
				success: true,
				data: {
					id: user.id,
					email: user.email,
					username: user.username,
					fullName: user.fullName,
					emailVerified: user.emailVerified,
					active: user.active,
					displayName: user.displayName,
					bio: user.bio,
					avatarUrl: user.avatarUrl,
					location: user.location,
					website: user.website,
					createdAt: user.createdAt.toISOString(),
					updatedAt: user.updatedAt.toISOString(),
				},
			},
			HttpStatus.OK.code,
		);
	},
});

export { validateCredentialsRoute };
