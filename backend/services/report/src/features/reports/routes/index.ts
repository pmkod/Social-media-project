import { createReportRoute } from "./create-report.route";
import { getMyReportsRoute } from "./get-my-reports.route";
import { getReportsRoute } from "./get-reports.route";
import { updateReportStatusRoute } from "./update-report-status.route";

const reportsRoutes = [
	createReportRoute,
	getMyReportsRoute,
	getReportsRoute,
	updateReportStatusRoute,
];

export { reportsRoutes };
