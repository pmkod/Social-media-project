import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/users/{id}/follow",
	summary: "Unfollow a user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ id: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "User unfollowed" },
	},
});

const unfollowUserRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { id: userId } = c.req.valid("param");

		const result = await prisma.$transaction(async (tx) => {
			const deleted = await tx.follow.deleteMany({
				where: { followerId: authenticatedUser.id, followingId: userId },
			});
			if (deleted.count > 0) {
				await Promise.all([
					tx.user.update({
						where: { id: authenticatedUser.id },
						data: { followingCount: { decrement: 1 } },
					}),
					tx.user.update({
						where: { id: userId },
						data: { followersCount: { decrement: 1 } },
					}),
				]);
			}

			return tx.user.findUnique({
				where: { id: userId },
				select: { followersCount: true },
			});
		});

		if (!result) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		return c.json({
			message: "Success",
		});
	},
});

export { unfollowUserRoute };
