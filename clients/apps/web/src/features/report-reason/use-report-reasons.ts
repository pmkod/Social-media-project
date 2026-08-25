import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { reportReasonQueryKeys } from "./common/report-reason.query-keys.ts";
import type { ReportReasonsResponse } from "./common/report-reason.ts";

const useReportReasons = () =>
	useQuery({
		queryKey: reportReasonQueryKeys.root,
		queryFn: () =>
			httpClient.get("report-reasons").json<ReportReasonsResponse>(),
		staleTime: 5 * 60 * 1000,
	});

export { useReportReasons };
