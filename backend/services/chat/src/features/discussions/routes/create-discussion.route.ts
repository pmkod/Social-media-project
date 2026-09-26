import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ExceptionCodes } from "@/core/exceptions/exception.codes";
import { Exception } from "@/core/exceptions/exception";
import { userServiceClient } from "@/core/service-clients/user-service.client";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { Prisma } from "@/generated/prisma/client";
import { DiscussionsRoutesTag } from "../discussions.constants";
import { uniqueOtherUserIds } from "../discussions.functions";
import {
	buildDiscussionResponses,
	discussionDetailsInclude,
} from "../discussions.service";
import { CreateDiscussionRequestBody } from "../discussions.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/chat/create-discussion",
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
		const authenticatedUserId = c.get("authenticatedUser").id;

		const data = c.req.valid("json");
		const memberIds = uniqueOtherUserIds(
			data.memberIds,
			authenticatedUserId,
		);

		if (data.type === "PRIVATE" && memberIds.length !== 1) {
			throw new Exception({
				code: ExceptionCodes.invalid_private_discussion_members,
				message: "A private discussion requires exactly one other member",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}
		if (data.type === "GROUP" && memberIds.length < 2) {
			throw new Exception({
				code: ExceptionCodes.insufficient_group_members,
				message: "A group discussion requires at least two other members",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}
		if (data.type === "GROUP" && !data.name) {
			throw new Exception({
				code: ExceptionCodes.group_name_required,
				message: "A group discussion requires a name",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}
		if (data.type === "PRIVATE" && (data.name || data.description)) {
			throw new Exception({
				code: ExceptionCodes.private_discussion_details_forbidden,
				message: "Private discussions cannot have a name or description",
				status: HttpStatus.BAD_REQUEST.code,
			});
		}

		const usersMap = await userServiceClient.fetchUsersBatchOrThrow(
			memberIds,
			authenticatedUserId,
		);
		const missingUserIds = memberIds.filter((userId) => !usersMap.has(userId));
		if (missingUserIds.length > 0) {
			throw new Exception({
				code: ExceptionCodes.users_not_found,
				message: `Users not found: ${missingUserIds.join(", ")}`,
				status: HttpStatus.NOT_FOUND.code,
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
			throw new Exception({
				code: ExceptionCodes.blocked_user_in_discussion,
				message: "A discussion cannot include a blocked user",
				status: HttpStatus.FORBIDDEN.code,
			});
		}

		if (data.type === "PRIVATE") {
			const otherUserId = memberIds[0];
			if (!otherUserId)
				throw new Exception({
					code: ExceptionCodes.private_discussion_member_missing,
					message: "Private discussion member missing",
					status: HttpStatus.INTERNAL_SERVER_ERROR.code,
				});
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
													hasLeft: false,
												},
											},
										},
										{
											members: {
												some: { userId: otherUserId, hasLeft: false },
											},
										},
										{
											members: {
												none: {
													userId: {
														notIn: [authenticatedUserId, otherUserId],
													},
													hasLeft: false,
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
				throw new Exception({
					code: ExceptionCodes.private_discussion_creation_failed,
					message: "Unable to create the private discussion",
					status: HttpStatus.INTERNAL_SERVER_ERROR.code,
				});
			}
			await prisma.discussionMember.update({
				where: {
					discussionId_userId: {
						discussionId: privateDiscussionResult.discussion.id,
						userId: authenticatedUserId,
					},
				},
				data: { isDeleted: false, isBlocked: false },
			});
			const authenticatedMembership =
				privateDiscussionResult.discussion.members.find(
					(member) => member.userId === authenticatedUserId,
				);
			if (authenticatedMembership) {
				authenticatedMembership.isDeleted = false;
				authenticatedMembership.isBlocked = false;
			}
			const [presentedDiscussion] = await buildDiscussionResponses(
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
		const [presentedDiscussion] = await buildDiscussionResponses(
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
