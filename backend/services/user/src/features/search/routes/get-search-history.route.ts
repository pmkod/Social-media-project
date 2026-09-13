import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	emptyProfileMediaFiles,
	getProfileMediaFilesByUsers,
} from "@/features/user/services/get-profile-media-files.service";
import { ProfileMediaFileResponseBody } from "@/features/user/user.validation-schemas";
import type { Prisma } from "@/generated/prisma/client";
import { SearchRoutesTag } from "../search.constants";

const SearchedUserResponseBody = z.object({
	id: z.string(),
	username: z.string(),
	fullName: z.string().nullable(),
	lowQualityProfilePictureFile: ProfileMediaFileResponseBody,
	bestQualityProfilePictureFile: ProfileMediaFileResponseBody,
	isFollowedByAuthenticatedUser: z.boolean(),
});

const SearchHistoryResponseBody = z.object({
	history: z.array(
		z.object({
			id: z.string(),
			text: z.string().nullable(),
			searchedUserId: z.string().nullable(),
			createdAt: z.string(),
			searchedUser: SearchedUserResponseBody.nullable(),
		}),
	),
	pagination: z.object({
		nextCursor: z.object({ id: z.string(), createdAt: z.string() }).nullable(),
		hasNextPage: z.boolean(),
		limit: z.number(),
	}),
});

const routeDef = createRoute({
	method: "get",
	path: "/search/history",
	summary: "Get the authenticated user's recent searches",
	tags: [SearchRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("20"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: {
			description: "Recent searches",
			content: {
				"application/json": { schema: SearchHistoryResponseBody },
			},
		},
	},
});

const getSearchHistoryRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");

		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 20, 1),
			50,
		);
		const cursorDate = query.cursorCreatedAt
			? new Date(query.cursorCreatedAt)
			: null;
		const hasValidCursor =
			cursorDate !== null &&
			!Number.isNaN(cursorDate.getTime()) &&
			Boolean(query.cursorId);
		const cursorCondition: Prisma.SearchHistoryWhereInput | undefined =
			hasValidCursor
				? {
						OR: [
							{ createdAt: { lt: cursorDate } },
							{ createdAt: cursorDate, id: { lt: query.cursorId } },
						],
					}
				: undefined;

		const blocks = await prisma.block.findMany({
			where: {
				OR: [
					{ blockerId: authenticatedUser.id },
					{ blockedId: authenticatedUser.id },
				],
			},
			select: { blockerId: true, blockedId: true },
		});
		const hiddenUserIds = blocks.map((block) =>
			block.blockerId === authenticatedUser.id
				? block.blockedId
				: block.blockerId,
		);
		const conditions: Prisma.SearchHistoryWhereInput[] = [
			{
				OR: [{ searchedUserId: null }, { searchedUser: { active: true } }],
			},
		];
		if (hiddenUserIds.length > 0) {
			conditions.push({
				OR: [
					{ searchedUserId: null },
					{ searchedUserId: { notIn: hiddenUserIds } },
				],
			});
		}
		if (cursorCondition) conditions.push(cursorCondition);

		const results = await prisma.searchHistory.findMany({
			where: {
				searcherId: authenticatedUser.id,
				AND: conditions,
			},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit + 1,
			select: {
				id: true,
				text: true,
				searchedUserId: true,
				createdAt: true,
				searchedUser: {
					select: {
						id: true,
						username: true,
						fullName: true,
						lowQualityProfilePictureFileId: true,
						bestQualityProfilePictureFileId: true,
					},
				},
			},
		});

		const hasNextPage = results.length > limit;
		const items = hasNextPage ? results.slice(0, limit) : results;
		const lastItem = items.at(-1);
		const searchedUsers = items.flatMap((item) =>
			item.searchedUser ? [item.searchedUser] : [],
		);
		const profileMediaFilesByUserId =
			await getProfileMediaFilesByUsers(searchedUsers);
		const searchedUserIds = items.flatMap((item) =>
			item.searchedUserId ? [item.searchedUserId] : [],
		);
		const followedUserIds = new Set(
			(
				await prisma.follow.findMany({
					where: {
						followerId: authenticatedUser.id,
						followingId: { in: searchedUserIds },
					},
					select: { followingId: true },
				})
			).map((follow) => follow.followingId),
		);

		return c.json({
			history: items.map((item) => ({
				...item,
				createdAt: item.createdAt.toISOString(),
				searchedUser: item.searchedUser
					? {
							id: item.searchedUser.id,
							username: item.searchedUser.username,
							fullName: item.searchedUser.fullName,
							...(profileMediaFilesByUserId.get(item.searchedUser.id) ??
								emptyProfileMediaFiles),
							isFollowedByAuthenticatedUser: followedUserIds.has(
								item.searchedUser.id,
							),
						}
					: null,
			})),
			pagination: {
				nextCursor:
					hasNextPage && lastItem
						? {
								id: lastItem.id,
								createdAt: lastItem.createdAt.toISOString(),
							}
						: null,
				hasNextPage,
				limit,
			},
		});
	},
});

export { getSearchHistoryRoute };
