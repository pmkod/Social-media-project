import { z } from "@hono/zod-openapi";

const CreateReportReasonSchema = z.object({
	name: z.string().trim().min(1).max(100),
	description: z.string().trim().max(500).optional(),
	active: z.boolean().optional(),
});

const UpdateReportReasonSchema = z.object({
	name: z.string().trim().min(1).max(100).optional(),
	description: z.string().trim().max(500).nullable().optional(),
	active: z.boolean().optional(),
});

export { CreateReportReasonSchema, UpdateReportReasonSchema };
