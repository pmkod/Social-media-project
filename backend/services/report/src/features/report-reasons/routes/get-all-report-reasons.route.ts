import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ReportReasonsRoutesTag } from "../report-reasons.constants";

const routeDef = createRoute({
	method: "get",
	path: "/internal/report-reasons",
	summary: "List report reasons for moderation",
	tags: [ReportReasonsRoutesTag],
	request: {
		query: z.object({
			active: z.enum(["true", "false"]).optional(),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Report reasons" },
	},
});

const getAllReportReasonsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const { active } = c.req.valid("query");
		const reportReasons = await prisma.reportReason.findMany({
			where: active === undefined ? undefined : { active: active === "true" },
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		});

		return c.json({ reportReasons });
	},
});

export { getAllReportReasonsRoute };
