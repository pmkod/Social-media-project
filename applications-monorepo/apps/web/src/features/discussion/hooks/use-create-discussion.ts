import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type {
	CreateDiscussionResponse,
	DiscussionResponse,
	DiscussionsResponse,
	DiscussionType,
} from "../common/discussion.ts";

type CreateDiscussionInput = {
	type: DiscussionType;
	memberIds: string[];
	name?: string;
	description?: string;
};

const useCreateDiscussion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateDiscussionInput) =>
			httpClient
				.post("chat/create-discussion", { json: input })
				.json<CreateDiscussionResponse>(),
		onSuccess: ({ discussion }) => {
			queryClient.setQueryData<DiscussionResponse>(
				discussionQueryKeys.detail(discussion.id),
				{ discussion },
			);
			queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
				{ queryKey: discussionQueryKeys.listsRoot },
				(data) => {
					if (!data?.pages.length) return data;

					const previousDiscussions = data.pages.flatMap(
						(page) => page.discussions,
					);
					const isAlreadyPresent = previousDiscussions.some(
						(item) => item.id === discussion.id,
					);
					const discussions = [
						discussion,
						...previousDiscussions.filter((item) => item.id !== discussion.id),
					];
					const capacity = data.pages.reduce(
						(total, page) => total + page.pagination.limit,
						0,
					);
					const previousLastPage = data.pages.at(-1);
					const serverHasMore =
						Boolean(previousLastPage?.pagination.hasNextPage) ||
						(!isAlreadyPresent && discussions.length > capacity);
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

export type { CreateDiscussionInput };
export { useCreateDiscussion };
