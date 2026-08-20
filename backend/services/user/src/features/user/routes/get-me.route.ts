import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	profileMediaSelect,
	serializeProfileMedia,
} from "../services/profile-media.service";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/me",
	summary: "Get current authenticated user profile",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const getMeRoute = defineOpenAPIRoute<typeof routeDef, HonoAuthenticatedEnv>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) {
			throw new Error("Unauthorized");
		}

		const user = await prisma.user.findUnique({
			where: { id: authenticatedUser.id },
			select: {
				id: true,
				email: true,
				username: true,
				fullName: true,
				bio: true,
				...profileMediaSelect,
				postCount: true,
				followersCount: true,
				followingCount: true,
				createdAt: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		return c.json({
			...serializeProfileMedia(user),
			isFollowedByAuthenticatedUser: false,
			isBlockedByAuthenticatedUser: false,
			hasBlockedAuthenticatedInUser: false,
		});
	},
});

export { getMeRoute };
