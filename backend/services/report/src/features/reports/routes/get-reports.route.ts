import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ReportsRoutesTag } from "../reports.constants";
import {
	ReportStatusSchema,
	ReportTargetTypeSchema,
} from "../reports.validation-schemas";

const routeDef = createRoute({
	method: "get",
	path: "/internal/reports",
	summary: "List reports for moderation",
	tags: [ReportsRoutesTag],
	request: {
		query: z.object({
			status: ReportStatusSchema.optional(),
			targetType: ReportTargetTypeSchema.optional(),
			limit: z.string().optional().default("20"),
			offset: z.string().optional().default("0"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Reports" },
	},
});

const getReportsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 20, 1),
			100,
		);
		const offset = Math.max(Number.parseInt(query.offset, 10) || 0, 0);
		const where = {
			...(query.status ? { status: query.status } : {}),
			...(query.targetType ? { targetType: query.targetType } : {}),
		};

		const reports = await prisma.report.findMany({
			where,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit,
			skip: offset,
			include: { reason: true },
		});
		const total = await prisma.report.count({ where });

		return c.json({ reports, pagination: { limit, offset, total } });
	},
});

export { getReportsRoute };
