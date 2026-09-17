import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { discussionQueryKeys } from "../common/discussion.query-keys";
import type {
	CreateMessageResponse,
	DiscussionResponse,
	DiscussionsResponse,
	MessagesResponse,
} from "../common/discussion";

type CreateMessageInput = {
	discussionId: string;
	content: string;
};

export const useCreateMessage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ discussionId, ...input }: CreateMessageInput) =>
			httpClient
				.post(`discussions/${discussionId}/messages`, { json: input })
				.json<CreateMessageResponse>(),
		onSuccess: ({ message }, { discussionId }) => {
			queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.messagesRoot(discussionId),
			});
			queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.listsRoot,
			});
		},
	});
};
