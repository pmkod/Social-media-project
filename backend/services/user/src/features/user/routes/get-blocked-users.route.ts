import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import type { Prisma } from "@/generated/prisma/client";
import { hydrateProfileMediaFiles } from "../services/get-profile-media-files.service";
import { UserRoutesTag } from "../user.constants";

const routeDef = createRoute({
	method: "get",
	path: "/users/me/blocked",
	summary: "Get users blocked by the authenticated user",
	tags: [UserRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			cursorId: z.string().optional(),
			cursorCreatedAt: z.string().optional(),
			limit: z.string().optional().default("20"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Blocked users" },
	},
});

const getBlockedUsersRoute = defineOpenAPIRoute<
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
			query.cursorId;
		const cursorCondition: Prisma.BlockWhereInput | undefined = hasValidCursor
			? {
					OR: [
						{ createdAt: { lt: cursorDate } },
						{ createdAt: cursorDate, blockedId: { lt: query.cursorId } },
					],
				}
			: undefined;

		const blocks = await prisma.block.findMany({
			where: {
				blockerId: authenticatedUser.id,
				blocked: { active: true },
				...cursorCondition,
			},
			orderBy: [{ createdAt: "desc" }, { blockedId: "desc" }],
			take: limit + 1,
			select: {
				blockedId: true,
				createdAt: true,
				blocked: {
					select: {
						id: true,
						username: true,
						fullName: true,
						bio: true,
						lowQualityProfilePictureFileId: true,
						bestQualityProfilePictureFileId: true,
						lowQualityCoverPictureFileId: true,
						bestQualityCoverPictureFileId: true,
						followersCount: true,
						followingCount: true,
						createdAt: true,
					},
				},
			},
		});

		const hasNextPage = blocks.length > limit;
		const items = hasNextPage ? blocks.slice(0, limit) : blocks;
		const lastItem = items.at(-1);
		const hydratedUsers = await hydrateProfileMediaFiles(
			items.map((item) => item.blocked),
		);

		return c.json({
			users: hydratedUsers.map((user) => ({
				...user,
				isFollowedByAuthenticatedUser: false,
				isBlockedByAuthenticatedUser: true,
			})),
			pagination: {
				nextCursor:
					hasNextPage && lastItem
						? {
								id: lastItem.blockedId,
								createdAt: lastItem.createdAt.toISOString(),
							}
						: null,
				hasNextPage,
				limit,
			},
		});
	},
});

export { getBlockedUsersRoute };
