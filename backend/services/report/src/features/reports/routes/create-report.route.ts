import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import type { HonoAuthenticatedEnv } from "@/core/types/hono-authenticated-env";
import { requireUserAuthentication } from "@/features/authentication/middlewares/require-user-authentication.middleware";
import { ReportsRoutesTag } from "../reports.constants";
import { CreateReportSchema } from "../reports.validation-schemas";

const routeDef = createRoute({
	method: "post",
	path: "/reports",
	summary: "Report a post, comment, or user",
	tags: [ReportsRoutesTag],
	middleware: [requireUserAuthentication],
	request: {
		body: {
			content: {
				"application/json": { schema: CreateReportSchema },
			},
		},
	},
	responses: {
		[HttpStatus.CREATED.code]: { description: "Report created" },
	},
});

const createReportRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const reporterId = c.get("authenticatedUserId");
		if (!reporterId) throw new Error("Unauthorized");

		const body = c.req.valid("json");

		await prisma.report.create({
			data: {
				reporterId,
				reasonId: body.reasonId,
				postId: body.postId,
				commentId: body.commentId,
				userId: body.userId,
				reasonText: body.reasonText,
				description: body.description,
			},
			include: { reason: true },
		});

		return c.json(
			{ message: "Report submitted successfully" },
			HttpStatus.CREATED.code,
		);
	},
});

export { createReportRoute };
