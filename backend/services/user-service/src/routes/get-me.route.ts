import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { UsersRoutesTag } from "@/constants/users.constants";
import { getUserProfileByUserId } from "@/services/users.service";
import type { AuthContext } from "@/core/middleware/auth.middleware";

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

const getMeRoute = defineOpenAPIRoute<typeof routeDef, AuthContext>({
	route: routeDef,
	handler: async (c) => {
		const userId = c.get("userId");
		const profile = await getUserProfileByUserId(userId);
		return c.json(
			{
				success: true,
				data: {
					id: profile.id,
					userId: profile.userId,
					displayName: profile.displayName,
					bio: profile.bio,
					avatarUrl: profile.avatarUrl,
					location: profile.location,
					website: profile.website,
					createdAt: profile.createdAt.toISOString(),
					updatedAt: profile.updatedAt.toISOString(),
				},
			},
			HttpStatus.OK.code,
		);
	},
});

export { getMeRoute };
