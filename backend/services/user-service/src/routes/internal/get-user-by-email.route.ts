import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/constants/http-status";
import { prisma } from "@/db";
import { GetUserByEmailQuerySchema } from "@/schemas/users.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/internal/users/by-email",
	summary: "Get user by email",
	request: {
		query: GetUserByEmailQuerySchema,
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "User found or not",
		},
	},
});

const getUserByEmailRoute = defineOpenAPIRoute<typeof routeDef>({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");

		const user = await prisma.user.findUnique({
			where: { email: query.email },
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

export { getUserByEmailRoute };
