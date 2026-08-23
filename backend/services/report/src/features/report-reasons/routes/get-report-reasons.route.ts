import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { ReportReasonsRoutesTag } from "../report-reasons.constants";

const routeDef = createRoute({
	method: "get",
	path: "/report-reasons",
	summary: "Get active report reasons",
	tags: [ReportReasonsRoutesTag],
	responses: {
		[HttpStatus.OK.code]: { description: "Active report reasons" },
	},
});

const getReportReasonsRoute = defineOpenAPIRoute({
	route: routeDef,
	handler: async (c) => {
		const reportReasons = await prisma.reportReason.findMany({
			where: { active: true },
			orderBy: [{ name: "asc" }, { id: "asc" }],
		});

		return c.json({ reportReasons });
	},
});

export { getReportReasonsRoute };
