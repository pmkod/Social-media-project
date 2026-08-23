import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ReportReasonsRoutesTag } from "../report-reasons.constants";
import { CreateReportReasonSchema } from "../report-reasons.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/internal/report-reasons",
	summary: "Create a report reason",
	tags: [ReportReasonsRoutesTag],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateReportReasonSchema },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Report reason created" },
		[HttpStatus.CONFLICT.code]: { description: "Report reason already exists" },
	},
});

const createReportReasonRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const body = c.req.valid("json");
		const duplicate = await prisma.reportReason.findFirst({
			where: { name: { equals: body.name, mode: "insensitive" } },
			select: { id: true },
		});

		if (duplicate) {
			return c.json(
				{ message: "A report reason with this name already exists" },
				HttpStatus.CONFLICT.code,
			);
		}

		const reportReason = await prisma.reportReason.create({
			data: {
				name: body.name,
				description: body.description?.trim() || null,
				active: body.active ?? true,
			},
		});

		return c.json({ reportReason }, HttpStatus.CREATED.code);
	},
});

export { createReportReasonRoute };
