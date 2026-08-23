type ReportStatus = "pending" | "rejected" | "resolved";
type ReportTargetType = "post" | "comment" | "user";

type ReportReason = {
	id: string;
	name: string;
	description?: string | null;
	createdAt: string;
	active: boolean;
};

type Report = {
	id: string;
	reporterId: string;
	reasonId: string;
	reasonText?: string | null;
	description?: string | null;
	targetType: ReportTargetType;
	targetId: string;
	status: ReportStatus;
	createdAt: string;
	reason: ReportReason;
};

type ReportReasonsResponse = {
	reportReasons: ReportReason[];
};

type CreateReportResponse = {
	message: string;
	report: Report;
};

export type { CreateReportResponse, ReportReasonsResponse, ReportTargetType };
