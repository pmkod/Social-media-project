import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";
import { GetUserByIdParamsSchema } from "@/schemas/users.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/internal/users/{id}",
	summary: "Get user by id",
	request: {
		params: GetUserByIdParamsSchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "User found",
		},
	},
});

const getUserByIdRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const params = c.req.valid("param");

		const user = await prisma.user.findUnique({
			where: { id: params.id },
		});

		if (!user) {
			throw new AppError({
				message: "User not found",
				code: ErrorCodes.NOT_FOUND,
				statusCode: 404,
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

export { getUserByIdRoute };
