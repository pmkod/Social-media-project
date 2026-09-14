import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import {
	emptyProfileMediaFiles,
	getProfileMediaFilesByUsers,
} from "@/features/user/services/get-profile-media-files.service";
import { SearchRoutesTag } from "../search.constants";

const CreateSearchHistoryBody = z.object({
	text: z.string().trim().max(255).optional(),
	searchedUserId: z.string().optional(),
});

const routeDef = createRoute({
	method: "post",
	path: "/search/history",
	summary: "Add an item to the authenticated user's search history",
	tags: [SearchRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateSearchHistoryBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Search history item created" },
		[HttpStatus.BAD_REQUEST.code]: {
			description: "Exactly one search target is required",
		},
		[HttpStatus.NOT_FOUND.code]: { description: "Target user not found" },
	},
});

const createSearchHistoryRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUser = c.get("authenticatedUser");

		const body = c.req.valid("json");
		const text = body.text?.trim() || undefined;
		const searchedUserId = body.searchedUserId;
		if (Boolean(text) === Boolean(searchedUserId)) {
			throw new Exception({
				message: "Provide exactly one of text or searchedUserId",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const searchedUserRecord = searchedUserId
			? await prisma.user.findFirst({
					where: { id: searchedUserId, active: true },
					select: {
						id: true,
						username: true,
						fullName: true,
						lowQualityProfilePictureFileId: true,
						bestQualityProfilePictureFileId: true,
						followers: {
							where: { followerId: authenticatedUser.id },
							select: { followerId: true },
							take: 1,
						},
					},
				})
			: null;
		const searchedUser = searchedUserRecord
			? {
					...searchedUserRecord,
					...((await getProfileMediaFilesByUsers([searchedUserRecord])).get(
						searchedUserRecord.id,
					) ?? emptyProfileMediaFiles),
				}
			: null;
		if (searchedUserId && !searchedUser) {
			throw new Exception({
				code: ExceptionCodes.user_not_found,
				message: "User not found",
				status: HttpStatus.NOT_FOUND.code,
			});
		}

		const historyItem = await prisma.$transaction(async (transaction) => {
			await transaction.searchHistory.deleteMany({
				where: {
					searcherId: authenticatedUser.id,
					...(text
						? { text: { equals: text, mode: "insensitive" } }
						: { searchedUserId }),
				},
			});

			return transaction.searchHistory.create({
				data: {
					searcherId: authenticatedUser.id,
					...(text ? { text } : { searchedUserId }),
				},
				select: {
					id: true,
					text: true,
					searchedUserId: true,
					createdAt: true,
				},
			});
		});

		const presentedSearchedUser = (() => {
			if (!searchedUser) return null;
			return {
				id: searchedUser.id,
				username: searchedUser.username,
				fullName: searchedUser.fullName,
				lowQualityProfilePictureFile: searchedUser.lowQualityProfilePictureFile,
				bestQualityProfilePictureFile:
					searchedUser.bestQualityProfilePictureFile,
				isFollowedByAuthenticatedUser: searchedUser.followers.length > 0,
			};
		})();

		return c.json(
			{ ...historyItem, searchedUser: presentedSearchedUser },
			HttpStatus.CREATED.code,
		);
	},
});

export { createSearchHistoryRoute };
