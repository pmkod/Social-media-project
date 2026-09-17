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
	DiscussionsResponse,
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
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) => {
					if (!data?.pages.length) return data;

					const previousDiscussions = data.pages.flatMap(
						(page) => page.discussions,
					);
					const discussion = previousDiscussions.find(
						(item) => item.id === discussionId,
					);
					if (!discussion) return data;

					const discussions = [
						{
							...discussion,
							isStarted: true,
							lastMessage: message,
							lastActivityAt: message.createdAt,
						},
						...previousDiscussions.filter((item) => item.id !== discussionId),
					];
					const capacity = data.pages.reduce(
						(total, page) => total + page.pagination.limit,
						0,
					);
					const serverHasMore = Boolean(
						data.pages.at(-1)?.pagination.hasNextPage,
					);
					const retainedDiscussions = discussions.slice(0, capacity);
					let offset = 0;

					return {
						...data,
						pages: data.pages.map((page, index) => {
							const pageDiscussions = retainedDiscussions.slice(
								offset,
								offset + page.pagination.limit,
							);
							offset += page.pagination.limit;
							const lastDiscussion = pageDiscussions.at(-1);
							const hasNextPage =
								index < data.pages.length - 1 || serverHasMore;

							return {
								...page,
								discussions: pageDiscussions,
								pagination: {
									...page.pagination,
									hasNextPage,
									nextCursor:
										hasNextPage && lastDiscussion
											? {
													activityAt: lastDiscussion.lastActivityAt,
													id: lastDiscussion.id,
												}
											: null,
								},
							};
						}),
					};
				},
			);
		},
	});
};

export { useCreateMessage };
