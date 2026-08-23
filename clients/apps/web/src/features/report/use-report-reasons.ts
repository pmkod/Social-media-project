import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { reportQueryKeys } from "./common/report.query-keys.ts";
import type { ReportReasonsResponse } from "./common/report.ts";

const useReportReasons = () =>
	useQuery({
		queryKey: reportQueryKeys.reasons,
		queryFn: () =>
			httpClient.get("report-reasons").json<ReportReasonsResponse>(),
		staleTime: 5 * 60 * 1000,
	});

export { useReportReasons };
