import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import {
	type UserProfileDto,
	userServiceClient,
} from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { StoriesRoutesTag } from "../stories.constants";

const routeDef = createRoute({
	method: "get",
	path: "/stories",
	middleware: [requireUserAuthentication],
	summary: "Get active stories from followed users",
	tags: [StoriesRoutesTag],
	responses: {
		[HttpStatus.OK.code]: {
			content: {
				"application/json": {
					schema: z.object({ stories: z.array(z.object()) }),
				},
			},
			description: "Active stories grouped by author",
		},
	},
});

const getStoriesRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");

		const [followingIds, blockRelationships] = await Promise.all([
			userServiceClient.fetchFollowingIds(authenticatedUserId),
			userServiceClient.fetchBlockRelationshipIds(authenticatedUserId),
		]);
		const hiddenUserIds = new Set([
			...blockRelationships.blockedUserIds,
			...blockRelationships.blockedByUserIds,
		]);
		const authorIds = [
			authenticatedUserId,
			...followingIds.filter((id) => !hiddenUserIds.has(id)),
		];
		const now = new Date();

		const activeStories = await prisma.story.findMany({
			where: {
				authorId: { in: authorIds },
				expiresAt: { gt: now },
			},
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			include: { mediaFile: true },
		});

		if (activeStories.length === 0) return c.json({ stories: [] });

		const storyIds = activeStories.map((story) => story.id);
		const [viewedStories, authorsMap] = await Promise.all([
			prisma.storyView.findMany({
				where: {
					storyId: { in: storyIds },
					viewerId: authenticatedUserId,
				},
				select: { storyId: true },
			}),
			userServiceClient.fetchAuthorsBatch(
				Array.from(new Set(activeStories.map((story) => story.authorId))),
				authenticatedUserId,
			),
		]);
		const viewedStoryIds = new Set(
			viewedStories.map((storyView) => storyView.storyId),
		);
		const groupedStories = new Map<
			string,
			{
				author: UserProfileDto | null;
				stories: typeof activeStories;
			}
		>();

		for (const story of activeStories) {
			const current = groupedStories.get(story.authorId);
			if (current) current.stories.push(story);
			else {
				groupedStories.set(story.authorId, {
					author: authorsMap.get(story.authorId) ?? null,
					stories: [story],
				});
			}
		}

		const stories = Array.from(groupedStories.entries())
			.map(([authorId, group]) => ({
				authorId,
				author: group.author,
				stories: group.stories.map((story) => ({
					...story,
					isViewedByAuthenticatedUser: viewedStoryIds.has(story.id),
				})),
				latestCreatedAt: group.stories.at(-1)?.createdAt ?? now,
				allStoriesViewed: group.stories.every((story) =>
					viewedStoryIds.has(story.id),
				),
			}))
			.sort((a, b) => {
				if (a.authorId === authenticatedUserId) return -1;
				if (b.authorId === authenticatedUserId) return 1;
				if (a.allStoriesViewed !== b.allStoriesViewed)
					return a.allStoriesViewed ? 1 : -1;
				return b.latestCreatedAt.getTime() - a.latestCreatedAt.getTime();
			})
			.map(
				({
					latestCreatedAt: _latestCreatedAt,
					allStoriesViewed: _allStoriesViewed,
					...storyGroup
				}) => storyGroup,
			);

		return c.json({ stories });
	},
});

export { getStoriesRoute };
