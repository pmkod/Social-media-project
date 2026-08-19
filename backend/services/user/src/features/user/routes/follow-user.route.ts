import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "post",
	path: "/users/{id}/follow",
	summary: "Follow a user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: { params: z.object({ id: z.string() }) },
	responses: {
		[HttpStatus.CREATED.code]: { description: "User followed" },
	},
});

const followUserRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");
		if (!authenticatedUser) throw new Error("Unauthorized");
		const { id: userId } = c.req.valid("param");

		if (userId === authenticatedUser.id) {
			return c.json(
				{ message: "You cannot follow yourself" },
				HttpStatus.BAD_REQUEST.code,
			);
		}

		const targetUser = await prisma.user.findFirst({
			where: { id: userId, active: true },
			select: { id: true },
		});
		if (targetUser === null) {
			return c.json({ message: "User not found" }, HttpStatus.NOT_FOUND.code);
		}

		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId: authenticatedUser.id,
					followingId: userId,
				},
			},
			select: { id: true },
		});

		if (!existingFollow) {
			await prisma.follow.create({
				data: { followerId: authenticatedUser.id, followingId: userId },
			});

			const [, updatedTargetUser] = await Promise.all([
				prisma.user.update({
					where: { id: authenticatedUser.id },
					data: { followingCount: { increment: 1 } },
				}),
				prisma.user.update({
					where: { id: userId },
					data: { followersCount: { increment: 1 } },
					select: { followersCount: true },
				}),
			]);
		}

		return c.json(
			{
				message: "Success",
				followedUser: {
					id: targetUser.id,
					isFollowedByAuthenticatedUser: true,
				},
			},
			HttpStatus.OK.code,
		);
	},
});

export { followUserRoute };
