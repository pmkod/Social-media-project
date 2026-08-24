import { createRoute, defineOpenAPIRoute, z } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { ReportsRoutesTag } from "../reports.constants";

const routeDef = createRoute({
	method: "get",
	path: "/reports/my",
	summary: "Get the authenticated user's reports",
	tags: [ReportsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		query: z.object({
			limit: z.string().optional().default("20"),
			offset: z.string().optional().default("0"),
		}),
	},
	responses: {
		[HttpStatus.OK.code]: { description: "Authenticated user's reports" },
	},
});

const getMyReportsRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const reporterId = c.get("authenticatedUserId");
		if (!reporterId) throw new Error("Unauthorized");

		const query = c.req.valid("query");
		const limit = Math.min(
			Math.max(Number.parseInt(query.limit, 10) || 20, 1),
			50,
		);
		const offset = Math.max(Number.parseInt(query.offset, 10) || 0, 0);

		const reports = await prisma.report.findMany({
			where: { reporterId },
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			take: limit,
			skip: offset,
			include: { reason: true },
		});
		const total = await prisma.report.count({ where: { reporterId } });

		return c.json({
			reports,
			pagination: { limit, offset, total },
		});
	},
});

export { getMyReportsRoute };
