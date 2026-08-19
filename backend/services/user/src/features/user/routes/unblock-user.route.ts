import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "delete",
	path: "/users/{id}/block",
	summary: "Unblock a user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ id: z.string() }) },
	responses: {
		[HttpStatus.OK.code]: { description: "User unblocked" },
		[HttpStatus.NOT_FOUND.code]: { description: "User not found" },
	},
});

const unblockUserRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { id: userId } = c.req.valid("param");

		const targetUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, followersCount: true, followingCount: true },
		});
		if (!targetUser) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		await prisma.block.deleteMany({
			where: { blockerId: authenticatedUser.id, blockedId: userId },
		});
		const reciprocalBlock = await prisma.block.findUnique({
			where: {
				blockerId_blockedId: {
					blockerId: userId,
					blockedId: authenticatedUser.id,
				},
			},
			select: { id: true },
		});

		return c.json({
			message: "Success",
			unblockedUser: {
				...targetUser,
				isFollowedByAuthenticatedUser: false,
				isBlockedByAuthenticatedUser: false,
				hasBlockedAuthenticatedInUser: Boolean(reciprocalBlock),
			},
		});
	},
});

export { unblockUserRoute };
