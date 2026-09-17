import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { ReportReasonsResponse } from "./common/report-reason";

export const useReportReasons = () =>
	useQuery({
		queryKey: ["report-reasons"],
		queryFn: () =>
			httpClient.get("report-reasons").json<ReportReasonsResponse>(),
		staleTime: 5 * 60 * 1000,
	});
