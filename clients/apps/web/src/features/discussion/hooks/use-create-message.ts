import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { updateDiscussionInCache } from "../common/discussion-cache.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type {
	CreateMessageResponse,
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
			updateDiscussionInCache(
				queryClient,
				discussionId,
				(discussion) => ({
					...discussion,
					isStarted: true,
					lastMessage: message,
					lastActivityAt: message.createdAt,
				}),
				{ moveToFront: true },
			);
		},
	});
};

export { useCreateMessage };
