import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { uuidv7 } from "uuidv7";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/db";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { CreateUserBodySchema } from "@/schemas/users.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/internal/users",
	summary: "Create a user",
	request: {
		body: {
			content: {
				"application/json": {
					schema: CreateUserBodySchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: {
			description: "User created",
		},
	},
});

const createUserRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const body = c.req.valid("json");

		const existingEmail = await prisma.user.findUnique({
			where: { email: body.email },
		});

		if (existingEmail) {
			throw new AppError({
				message: "Email already taken",
				code: ErrorCodes.CONFLICT,
				statusCode: 409,
			});
		}

		const existingUsername = await prisma.user.findUnique({
			where: { username: body.username },
		});

		if (existingUsername) {
			throw new AppError({
				message: "Username already taken",
				code: ErrorCodes.CONFLICT,
				statusCode: 409,
			});
		}

		const user = await prisma.user.create({
			data: {
				id: uuidv7(),
				email: body.email,
				username: body.username,
				passwordHash: body.passwordHash,
				fullName: body.fullName,
				emailVerified: true,
				active: true,
			},
			select: { id: true },
		});

		return c.json({ success: true, data: { id: user.id } }, HttpStatus.CREATED.code);
	},
});

export { createUserRoute };
