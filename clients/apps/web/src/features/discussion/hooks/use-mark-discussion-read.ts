import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type {
	DiscussionResponse,
	DiscussionsResponse,
} from "../common/discussion.ts";

type MarkDiscussionReadInput = {
	discussionId: string;
	messageId?: string;
};

const useMarkDiscussionRead = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ discussionId, messageId }: MarkDiscussionReadInput) =>
			httpClient
				.patch(`discussions/${discussionId}/read`, {
					json: messageId ? { messageId } : {},
				})
				.json<{ readAt: string; unreadCount: number }>(),
		onSuccess: ({ unreadCount }, { discussionId }) => {
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) =>
					data
						? {
								...data,
								pages: data.pages.map((page) => ({
									...page,
									discussions: page.discussions.map((discussion) =>
										discussion.id === discussionId
											? { ...discussion, unreadCount }
											: discussion,
									),
								})),
							}
						: data,
			);
			queryClient.setQueryData<DiscussionResponse>(
				discussionQueryKeys.detail(discussionId),
				(data) =>
					data
						? {
								...data,
								discussion: { ...data.discussion, unreadCount },
							}
						: data,
			);
		},
	});
};

export { useMarkDiscussionRead };
