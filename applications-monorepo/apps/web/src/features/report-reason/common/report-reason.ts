type ReportReason = {
	id: string;
	name: string;
	description?: string | null;
	createdAt: string;
	active: boolean;
};

type ReportReasonsResponse = {
	reportReasons: ReportReason[];
};

export type { ReportReason, ReportReasonsResponse };
