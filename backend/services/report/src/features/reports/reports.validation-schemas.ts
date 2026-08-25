import { z } from "@hono/zod-openapi";

const ReportStatusSchema = z.enum(["pending", "rejected", "resolved"]);

const OptionalIdSchema = z.string().trim().min(1).optional();

const ReportTargetSchema = z
	.object({
		postId: OptionalIdSchema,
		commentId: OptionalIdSchema,
		userId: OptionalIdSchema,
	})
	.refine(
		(value) =>
			[value.postId, value.commentId, value.userId].filter(Boolean).length === 1,
		{
			message: "Exactly one report target is required",
		},
	);

const CreateReportSchema = z
	.object({
		reasonId: OptionalIdSchema,
		reasonText: z.string().trim().max(280).optional(),
		description: z.string().trim().max(2000).optional(),
		postId: OptionalIdSchema,
		commentId: OptionalIdSchema,
		userId: OptionalIdSchema,
	})
	.refine(
		(value) =>
			[value.postId, value.commentId, value.userId].filter(Boolean).length === 1,
		{
			message: "Exactly one report target is required",
		},
	)
	.refine((value) => Boolean(value.reasonId || value.reasonText?.trim()), {
		message: "A report reason is required",
		path: ["reasonId"],
	});

export { CreateReportSchema, ReportStatusSchema, ReportTargetSchema };
