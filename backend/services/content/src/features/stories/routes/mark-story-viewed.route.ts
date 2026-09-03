import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { StoriesRoutesTag } from "../stories.constants";

const routeDef = createRoute({
	method: "post",
	path: "/stories/{storyId}/view",
	middleware: [requireUserAuthentication],
	summary: "Mark a story as viewed",
	tags: [StoriesRoutesTag],
	request: {
		params: z.object({ storyId: z.string() }),
	},
	responses: {
		[HttpStatus.OK.code]: {
			content: {
				"application/json": { schema: z.object({ success: z.boolean() }) },
			},
			description: "Story marked as viewed",
		},
		[HttpStatus.NOT_FOUND.code]: { description: "Story not found" },
	},
});

const markStoryViewedRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");
		const { storyId } = c.req.valid("param");
		const story = await prisma.story.findUnique({
			where: { id: storyId },
			select: { authorId: true, expiresAt: true },
		});

		if (!story || story.expiresAt <= new Date()) {
			return c.json({ message: "Story not found" }, HttpStatus.NOT_FOUND.code);
		}
		if (
			story.authorId !== authenticatedUserId &&
			(await userServiceClient.hasBlockRelationship(
				authenticatedUserId,
				story.authorId,
			))
		) {
			return c.json({ message: "Story not found" }, HttpStatus.NOT_FOUND.code);
		}

		await prisma.storyView.upsert({
			where: {
				storyId_viewerId: {
					storyId,
					viewerId: authenticatedUserId,
				},
			},
			create: { storyId, viewerId: authenticatedUserId },
			update: { viewedAt: new Date() },
		});

		return c.json({ success: true }, HttpStatus.OK.code);
	},
});

export { markStoryViewedRoute };
