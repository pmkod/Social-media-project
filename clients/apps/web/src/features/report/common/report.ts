import type { ReportReason } from "@/features/report-reason/common/report-reason.ts";

type ReportStatus = "pending" | "rejected" | "resolved";

type Report = {
	id: string;
	reporterId: string;
	reasonId?: string | null;
	reasonText?: string | null;
	description?: string | null;
	postId?: string | null;
	commentId?: string | null;
	userId?: string | null;
	status: ReportStatus;
	createdAt: string;
	reason?: ReportReason | null;
};

type CreateReportResponse = {
	message: string;
	report: Report;
};

export type { CreateReportResponse };
