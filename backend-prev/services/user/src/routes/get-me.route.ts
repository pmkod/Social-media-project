import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/constants/http-status";
import { UsersRoutesTag } from "@/constants/users.constants";
import { prisma } from "@/database";
import { AppError, ErrorCodes } from "@/errors/app-error";

const routeDef = createRoute({
	method: "get",
	path: "/users/me",
	summary: "Get current user profile",
	tags: [UsersRoutesTag],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Current user profile",
		},
	},
});

const getMeRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const userId = c.req.header("X-User-Id");

		if (!userId) {
			throw new AppError({
				message: "Missing user identity",
				code: ErrorCodes.UNAUTHORIZED,
				statusCode: 401,
			});
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
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

export { getMeRoute };
