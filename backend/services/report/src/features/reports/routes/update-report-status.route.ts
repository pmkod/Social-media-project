import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ReportsRoutesTag } from "../reports.constants";
import { ReportStatusSchema } from "../reports.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/internal/reports/{reportId}/status",
	summary: "Update a report moderation status",
	tags: [ReportsRoutesTag],
	request: {
		params: z.object({ reportId: z.string() }),
		body: {
			content: {
				"application/json": {
					schema: z.object({ status: ReportStatusSchema }),
				},
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Report status updated" },
		[HttpStatus.NOT_FOUND.code]: { description: "Report not found" },
	},
});

const updateReportStatusRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { reportId } = c.req.valid("param");
		const { status } = c.req.valid("json");
		const existingReport = await prisma.report.findUnique({
			where: { id: reportId },
			select: { id: true },
		});

		if (!existingReport) {
			return c.json({ message: "Report not found" }, HttpStatus.NOT_FOUND.code);
		}

		const report = await prisma.report.update({
			where: { id: reportId },
			data: { status },
			include: { reason: true },
		});

		return c.json({ message: "Report status updated", report });
	},
});

export { updateReportStatusRoute };
