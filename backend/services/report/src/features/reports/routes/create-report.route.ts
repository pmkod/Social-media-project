import { createRoute, defineOpenAPIRoute } from "@hono/zod-openapi";
import { HttpStatus } from "@/core/constants/http-status";
import { prisma } from "@/core/databases";
import { reportTargetExists } from "@/core/services/report-target.service";
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
		[HttpStatus.BAD_REQUEST.code]: { description: "Invalid report details" },
		[HttpStatus.NOT_FOUND.code]: { description: "Reason or target not found" },
		[HttpStatus.CONFLICT.code]: {
			description: "A pending report already exists for this target",
		},
	},
});

const normalizeOptionalText = (value?: string) => value?.trim() || null;

const createReportRoute = defineOpenAPIRoute<
	typeof routeDef,
	HonoAuthenticatedEnv
>({
	route: routeDef,
	handler: async (c) => {
		const reporterId = c.get("authenticatedUserId");
		if (!reporterId) throw new Error("Unauthorized");

		const body = c.req.valid("json");
		const reason = await prisma.reportReason.findFirst({
			where: { id: body.reasonId, active: true },
			select: { id: true, name: true },
		});

		if (!reason) {
			return c.json(
				{ message: "Report reason not found or inactive" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		const needsCustomReason = ["other", "autre"].includes(
			reason.name.trim().toLocaleLowerCase(),
		);
		if (needsCustomReason && !body.reasonText?.trim()) {
			return c.json(
				{ message: "A custom reason is required" },
				HttpStatus.BAD_REQUEST.code,
			);
		}

		if (!(await reportTargetExists(body.targetType, body.targetId))) {
			return c.json(
				{ message: "Reported content not found" },
				HttpStatus.NOT_FOUND.code,
			);
		}

		const pendingReport = await prisma.report.findFirst({
			where: {
				reporterId,
				targetType: body.targetType,
				targetId: body.targetId,
				status: "pending",
			},
			select: { id: true },
		});

		if (pendingReport) {
			return c.json(
				{
					message: "You already have a pending report for this content",
					reportId: pendingReport.id,
				},
				HttpStatus.CONFLICT.code,
			);
		}

		const report = await prisma.report.create({
			data: {
				reporterId,
				reasonId: reason.id,
				reasonText: normalizeOptionalText(body.reasonText),
				description: normalizeOptionalText(body.description),
				targetType: body.targetType,
				targetId: body.targetId,
			},
			include: { reason: true },
		});

		return c.json(
			{ message: "Report submitted successfully", report },
			HttpStatus.CREATED.code,
		);
	},
});

export { createReportRoute };
