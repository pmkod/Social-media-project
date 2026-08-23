import { z } from "@hono/zod-openapi";

const ReportStatusSchema = z.enum(["pending", "rejected", "resolved"]);
const ReportTargetTypeSchema = z.enum(["post", "comment", "user"]);

const CreateReportSchema = z.object({
	reasonId: z.string().trim().min(1),
	reasonText: z.string().trim().max(280).optional(),
	description: z.string().trim().max(2000).optional(),
	targetType: ReportTargetTypeSchema,
	targetId: z.string().trim().min(1),
});

type ReportTargetTypeValue = z.infer<typeof ReportTargetTypeSchema>;

export { CreateReportSchema, ReportStatusSchema, ReportTargetTypeSchema };
export type { ReportTargetTypeValue };
