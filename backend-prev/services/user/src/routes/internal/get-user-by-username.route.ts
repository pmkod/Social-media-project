import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/database";
import { GetUserByUsernameQuerySchema } from "@/schemas/users.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/internal/users/by-username",
	summary: "Get user by username",
	request: {
		query: GetUserByUsernameQuerySchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "User found or not",
		},
	},
});

const getUserByUsernameRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");

		const user = await prisma.user.findUnique({
			where: { username: query.username },
		});

		if (!user) {
			return c.json({ success: true, data: null }, HttpStatus.OK.code);
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

export { getUserByUsernameRoute };
