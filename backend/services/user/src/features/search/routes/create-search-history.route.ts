import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { SearchRoutesTag } from "../search.constants";

const CreateSearchHistoryBody = z.object({
	text: z.string().trim().max(255).optional(),
	userId: z.string().optional(),
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
		if (!authenticatedUser) throw new Error("Unauthorized");

		const body = c.req.valid("json");
		const text = body.text?.trim() || undefined;
		const userId = body.userId;
		if (Boolean(text) === Boolean(userId)) {
			return c.json(
				{ message: "Provide exactly one of text or userId" },
				HttpStatus.BAD_REQUEST.code,
			);
		}

		if (userId) {
			const targetUser = await prisma.user.findFirst({
				where: { id: userId, active: true },
				select: { id: true },
			});
			if (!targetUser) {
				return c.json(
					{ message: "User not found" },
					HttpStatus.NOT_FOUND.code,
				);
			}
		}

		const historyItem = await prisma.$transaction(async (transaction) => {
			await transaction.searchHistory.deleteMany({
				where: {
					ownerId: authenticatedUser.id,
					...(text
						? { text: { equals: text, mode: "insensitive" } }
						: { userId }),
				},
			});

			return transaction.searchHistory.create({
				data: {
					ownerId: authenticatedUser.id,
					...(text ? { text } : { userId }),
				},
				select: {
					id: true,
					text: true,
					userId: true,
					createdAt: true,
				},
			});
		});

		return c.json(
			{ ...historyItem, user: null },
			HttpStatus.CREATED.code,
		);
	},
});

export { createSearchHistoryRoute };
