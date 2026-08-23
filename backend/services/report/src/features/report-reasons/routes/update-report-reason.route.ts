import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ReportReasonsRoutesTag } from "../report-reasons.constants";
import { UpdateReportReasonSchema } from "../report-reasons.validation-schemas";

const routeDef = createRoute({
	method: "patch",
	path: "/internal/report-reasons/{reasonId}",
	summary: "Update or deactivate a report reason",
	tags: [ReportReasonsRoutesTag],
	request: {
		params: z.object({ reasonId: z.string() }),
		body: {
			content: {
				"application/json": { schema: UpdateReportReasonSchema },
			},
		},
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Report reason updated" },
		[HttpStatus.NOT_FOUND.code]: { description: "Report reason not found" },
		[HttpStatus.CONFLICT.code]: { description: "Report reason name conflict" },
	},
});

const updateReportReasonRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { reasonId } = c.req.valid("param");
		const body = c.req.valid("json");
		const existingReason = await prisma.reportReason.findUnique({
			where: { id: reasonId },
			select: { id: true },
		});

		if (!existingReason) {
			return c.json(
				{ message: "Report reason not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		if (body.name) {
			const duplicate = await prisma.reportReason.findFirst({
				where: {
					id: { not: reasonId },
					name: { equals: body.name, mode: "insensitive" },
				},
				select: { id: true },
			});
			if (duplicate) {
				return c.json(
					{ message: "A report reason with this name already exists" },
					HttpStatus.CONFLICT.code,
				);
			}
		}

		const reportReason = await prisma.reportReason.update({
			where: { id: reasonId },
			data: {
				name: body.name,
				description:
					body.description === undefined
						? undefined
						: body.description?.trim() || null,
				active: body.active,
			},
		});

		return c.json({ reportReason });
	},
});

export { updateReportReasonRoute };
