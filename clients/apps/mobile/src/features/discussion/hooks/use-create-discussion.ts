import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { discussionQueryKeys } from "../common/discussion.query-keys";
import type {
	CreateDiscussionResponse,
	DiscussionType,
} from "../common/discussion";

export type CreateDiscussionInput = {
	type: DiscussionType;
	memberIds: string[];
	name?: string;
	description?: string;
};

export const useCreateDiscussion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateDiscussionInput) =>
			httpClient
				.post("discussions", { json: input })
				.json<CreateDiscussionResponse>(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.listsRoot,
			});
		},
	});
};
