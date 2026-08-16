import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";
import { UpdateProfileValidationSchema } from "../user.validation-schemas";

const routeDef = createRoute({
	method: "put",
	path: "/users/me",
	summary: "Update current authenticated user profile",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": {
					schema: UpdateProfileValidationSchema,
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Success",
		},
	},
});

const updateProfileRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) {
			throw new Error("Unauthorized");
		}

		const body = c.req.valid("json");

		const updatedUser = await prisma.user.update({
			where: { id: authenticatedUser.id },
			data: body,
			select: {
				id: true,
				email: true,
				username: true,
				fullName: true,
				displayName: true,
				bio: true,
				avatarUrl: true,
				coverUrl: true,
				location: true,
				website: true,
				postCount: true,
				followersCount: true,
				followingCount: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return c.json(updatedUser);
	},
});

export { updateProfileRoute };
