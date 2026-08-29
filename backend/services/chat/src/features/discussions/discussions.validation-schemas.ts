import { z } from "@hono/zod-openapi";
import {
	DiscussionTypes,
	EditableDiscussionMemberRoles,
} from "./discussions.constants";

const CreateDiscussionRequestBody = z.object({
	type: z.enum(DiscussionTypes),
	memberIds: z.array(z.string().min(1)).min(1).max(99),
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).optional(),
});

const UpdateDiscussionRequestBody = z
	.object({
		name: z.string().trim().min(1).max(100).optional(),
		description: z.string().trim().max(500).nullable().optional(),
	})
	.refine((data) => data.name !== undefined || data.description !== undefined, {
		message: "At least one field must be provided",
	});

const AddDiscussionMembersRequestBody = z.object({
	userIds: z.array(z.string().min(1)).min(1).max(50),
});

const UpdateDiscussionMemberRequestBody = z.object({
	role: z.enum(EditableDiscussionMemberRoles),
});

const MarkDiscussionReadRequestBody = z.object({
	messageId: z.string().min(1).optional(),
});

const DiscussionIdParams = z.object({
	discussionId: z.string().min(1),
});

const DiscussionMemberParams = z.object({
	discussionId: z.string().min(1),
	userId: z.string().min(1),
});

export {
	AddDiscussionMembersRequestBody,
	CreateDiscussionRequestBody,
	DiscussionIdParams,
	DiscussionMemberParams,
	MarkDiscussionReadRequestBody,
	UpdateDiscussionMemberRequestBody,
	UpdateDiscussionRequestBody,
};
