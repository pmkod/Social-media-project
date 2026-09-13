import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { hydrateProfileMediaFiles } from "../services/get-profile-media-files.service";
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

		const user = await prisma.user.findUnique({
			where: { id: authenticatedUser.id },
			select: {
				id: true,
				email: true,
				username: true,
				fullName: true,
				unseenNotificationsCount: true,
				createdAt: true,
				lowQualityProfilePictureFileId: true,
				bestQualityProfilePictureFileId: true,
			},
		});

		if (!user) {
			throw new Error("User not found");
		}
		const [hydratedUser] = await hydrateProfileMediaFiles([user]);

		return c.json(
			{
				user: hydratedUser,
			},
			HttpStatus.OK.code,
		);
	},
});

export { getMeRoute };
