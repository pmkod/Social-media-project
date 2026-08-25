type ReportStatus = "pending" | "rejected" | "resolved";

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

type ReportTargetInput =
	| { postId: string; commentId?: never; userId?: never }
	| { postId?: never; commentId: string; userId?: never }
	| { postId?: never; commentId?: never; userId: string };

type ReportReasonsResponse = {
	reportReasons: ReportReason[];
};

type CreateReportResponse = {
	message: string;
	report: Report;
};

export type {
	CreateReportResponse,
	ReportReason,
	ReportReasonsResponse,
	ReportTargetInput,
};
