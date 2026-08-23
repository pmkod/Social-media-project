import { createReportReasonRoute } from "./create-report-reason.route";
import { getAllReportReasonsRoute } from "./get-all-report-reasons.route";
import { getReportReasonsRoute } from "./get-report-reasons.route";
import { updateReportReasonRoute } from "./update-report-reason.route";

const reportReasonsRoutes = [
	getReportReasonsRoute,
	getAllReportReasonsRoute,
	createReportReasonRoute,
	updateReportReasonRoute,
];

export { reportReasonsRoutes };
