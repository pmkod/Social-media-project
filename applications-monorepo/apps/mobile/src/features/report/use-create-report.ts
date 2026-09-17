import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { CreateReportResponse } from "./common/report";

export type CreateReportInput = {
	reasonId?: string;
	reasonText?: string;
	postId?: string;
	commentId?: string;
	userId?: string;
	discussionId?: string;
};

export const useCreateReport = () => {
	return useMutation({
		mutationFn: (input: CreateReportInput) =>
			httpClient.post("reports", { json: input }).json<CreateReportResponse>(),
	});
};
