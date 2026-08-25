import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { reportQueryKeys } from "./common/report.query-keys.ts";
import type {
	CreateReportResponse,
	ReportTargetInput,
} from "./common/report.ts";

type CreateReportInput = ReportTargetInput & {
	reasonId?: string;
	reasonText?: string;
	description?: string;
};

const useCreateReport = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateReportInput) =>
			httpClient.post("reports", { json: input }).json<CreateReportResponse>(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: reportQueryKeys.root });
		},
	});
};

export { useCreateReport };
