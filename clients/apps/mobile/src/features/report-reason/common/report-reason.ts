export type ReportReason = {
	id: string;
	name: string;
	description?: string | null;
};

export type ReportReasonsResponse = {
	reasons: ReportReason[];
};
