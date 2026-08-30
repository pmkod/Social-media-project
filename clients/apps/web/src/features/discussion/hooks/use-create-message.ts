import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type {
	CreateMessageResponse,
	DiscussionResponse,
	MessagesResponse,
} from "../common/discussion.ts";

type CreateMessageInput = {
	discussionId: string;
	content: string;
	parentMessageId?: string;
};

const useCreateMessage = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ discussionId, ...input }: CreateMessageInput) =>
			httpClient
				.post(`discussions/${discussionId}/messages`, { json: input })
				.json<CreateMessageResponse>(),
		onSuccess: ({ message }, { discussionId }) => {
			queryClient.setQueriesData<InfiniteData<MessagesResponse>>(
				{
					queryKey: discussionQueryKeys.messagesRoot(discussionId),
					exact: false,
				},
				(data) => {
					if (!data?.pages.length) return data;
					if (
						data.pages.some((page) =>
							page.messages.some((item) => item.id === message.id),
						)
					) {
						return data;
					}

					return {
						...data,
						pages: data.pages.map((page, index) =>
							index === 0
								? { ...page, messages: [message, ...page.messages] }
								: page,
						),
					};
				},
			);
			queryClient.setQueryData<DiscussionResponse>(
				discussionQueryKeys.detail(discussionId),
				(data) =>
					data
						? {
								...data,
								discussion: {
									...data.discussion,
									isStarted: true,
									lastMessage: message,
									lastActivityAt: message.createdAt,
								},
							}
						: data,
			);
			void queryClient.invalidateQueries({
				queryKey: discussionQueryKeys.root,
			});
		},
	});
};

export { useCreateMessage };
