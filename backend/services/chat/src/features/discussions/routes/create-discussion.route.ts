import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { userServiceClient } from "@/core/services/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { Prisma } from "@/generated/prisma/client";
import { HTTPException } from "hono/http-exception";
import { DiscussionsRoutesTag } from "../discussions.constants";
import { uniqueOtherUserIds } from "../discussions.functions";
import {
	discussionDetailsInclude,
	presentDiscussions,
} from "../discussions.presenter";
import { CreateDiscussionRequestBody } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/discussions",
	summary: "Create a private or group discussion",
	tags: [DiscussionsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateDiscussionRequestBody },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Discussion created" },
		[HttpStatus.OK.code]: { description: "Existing private discussion" },
		[HttpStatus.BAD_REQUEST.code]: { description: "Invalid members" },
		[HttpStatus.FORBIDDEN.code]: { description: "Blocked relationship" },
	},
});

const createDiscussionRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const authenticatedUserId = c.get("authenticatedUserId");
		if (!authenticatedUserId) throw new Error("Unauthorized");

		const data = c.req.valid("json");
		const memberIds = uniqueOtherUserIds(
			data.memberIds,
			authenticatedUserId,
		);

		if (data.type === "PRIVATE" && memberIds.length !== 1) {
			throw new HTTPException(400, {
				message: "A private discussion requires exactly one other member",
			});
		}
		if (data.type === "GROUP" && memberIds.length < 2) {
			throw new HTTPException(400, {
				message: "A group discussion requires at least two other members",
			});
		}
		if (data.type === "GROUP" && !data.name) {
			throw new HTTPException(400, {
				message: "A group discussion requires a name",
			});
		}
		if (data.type === "PRIVATE" && (data.name || data.description)) {
			throw new HTTPException(400, {
				message: "Private discussions cannot have a name or description",
			});
		}

		const usersMap = await userServiceClient.fetchUsersBatchOrThrow(
			memberIds,
			authenticatedUserId,
		);
		const missingUserIds = memberIds.filter((userId) => !usersMap.has(userId));
		if (missingUserIds.length > 0) {
			throw new HTTPException(404, {
				message: `Users not found: ${missingUserIds.join(", ")}`,
			});
		}
		const blockedUser = memberIds.find((userId) => {
			const user = usersMap.get(userId);
			return (
				user?.isBlockedByAuthenticatedUser ||
				user?.hasBlockedAuthenticatedInUser
			);
		});
		if (blockedUser) {
			throw new HTTPException(403, {
				message: "A discussion cannot include a blocked user",
			});
		}

		if (data.type === "PRIVATE") {
			const otherUserId = memberIds[0];
			if (!otherUserId) throw new Error("Private discussion member missing");
			let privateDiscussionResult:
				| {
						created: boolean;
						discussion: Prisma.DiscussionGetPayload<{
							include: typeof discussionDetailsInclude;
						}>;
					}
				| undefined;

			for (let attempt = 1; attempt <= 3; attempt += 1) {
				try {
					privateDiscussionResult = await prisma.$transaction(
						async (tx) => {
							const existingDiscussion = await tx.discussion.findFirst({
								where: {
									type: "PRIVATE",
									deletedAt: null,
									AND: [
										{
											members: {
												some: {
													userId: authenticatedUserId,
													leftAt: null,
												},
											},
										},
										{
											members: {
												some: { userId: otherUserId, leftAt: null },
											},
										},
										{
											members: {
												none: {
													userId: {
														notIn: [authenticatedUserId, otherUserId],
													},
													leftAt: null,
												},
											},
										},
									],
								},
								include: discussionDetailsInclude,
							});
							if (existingDiscussion) {
								return { created: false, discussion: existingDiscussion };
							}

							const now = new Date();
							const discussion = await tx.discussion.create({
								data: {
									type: "PRIVATE",
									creatorId: authenticatedUserId,
									members: {
										create: [authenticatedUserId, otherUserId].map(
											(userId) => ({
												userId,
												role: "MEMBER",
												lastReadAt: now,
											}),
										),
									},
								},
								include: discussionDetailsInclude,
							});
							return { created: true, discussion };
						},
						{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
					);
					break;
				} catch (error) {
					const canRetry =
						error instanceof Prisma.PrismaClientKnownRequestError &&
						error.code === "P2034" &&
						attempt < 3;
					if (!canRetry) throw error;
				}
			}

			if (!privateDiscussionResult) {
				throw new Error("Unable to create the private discussion");
			}
			const [presentedDiscussion] = await presentDiscussions(
				[privateDiscussionResult.discussion],
				authenticatedUserId,
			);
			return c.json(
				{
					created: privateDiscussionResult.created,
					discussion: presentedDiscussion,
				},
				privateDiscussionResult.created
					? HttpStatus.CREATED.code
					: HttpStatus.OK.code,
			);
		}

		const now = new Date();
		const discussion = await prisma.discussion.create({
			data: {
				type: "GROUP",
				name: data.name,
				description: data.description || null,
				creatorId: authenticatedUserId,
				members: {
					create: [
						{
							userId: authenticatedUserId,
							role: "OWNER",
							lastReadAt: now,
						},
						...memberIds.map((userId) => ({
							userId,
							role: "MEMBER" as const,
							lastReadAt: now,
						})),
					],
				},
			},
			include: discussionDetailsInclude,
		});
		const [presentedDiscussion] = await presentDiscussions(
			[discussion],
			authenticatedUserId,
		);
		return c.json(
			{ created: true, discussion: presentedDiscussion },
			HttpStatus.CREATED.code,
		);
	},
});

export { createDiscussionRoute };
