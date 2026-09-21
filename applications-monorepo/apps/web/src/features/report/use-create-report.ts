import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { CreateReportResponse } from "./common/report.ts";

type CreateReportInput = {
	reasonId?: string;
	reasonText?: string;
	postId?: string;
	commentId?: string;
	userId?: string;
	discussionId?: string;
};

const useCreateReport = () => {
	return useMutation({
		mutationFn: (input: CreateReportInput) =>
			httpClient.post("report/create-report", { json: input }).json<CreateReportResponse>(),
	});
};

export { useCreateReport };
