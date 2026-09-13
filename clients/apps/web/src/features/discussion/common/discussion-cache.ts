import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { discussionQueryKeys } from "./discussion.query-keys.ts";
import type {
	Discussion,
	DiscussionResponse,
	DiscussionsResponse,
} from "./discussion.ts";

const upsertDiscussionInInfiniteData = (
	data: InfiniteData<DiscussionsResponse> | undefined,
	discussion: Discussion,
	insertIfMissing: boolean,
) => {
	if (!data?.pages.length) return data;

	const previousDiscussions = data.pages.flatMap((page) => page.discussions);
	const isAlreadyPresent = previousDiscussions.some(
		(item) => item.id === discussion.id,
	);
	if (!isAlreadyPresent && !insertIfMissing) return data;

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
};

const upsertDiscussionInCache = (
	queryClient: QueryClient,
	discussion: Discussion,
) => {
	queryClient.setQueryData<DiscussionResponse>(
		discussionQueryKeys.detail(discussion.id),
		{ discussion },
	);
	queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
		{ queryKey: discussionQueryKeys.listsRoot },
		(data) => upsertDiscussionInInfiniteData(data, discussion, true),
	);
};

const updateDiscussionInCache = (
	queryClient: QueryClient,
	discussionId: string,
	updater: (discussion: Discussion) => Discussion,
	options: { moveToFront?: boolean } = {},
) => {
	queryClient.setQueryData<DiscussionResponse>(
		discussionQueryKeys.detail(discussionId),
		(data) =>
			data
				? { ...data, discussion: updater(data.discussion) }
				: data,
	);
	queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
		{ queryKey: discussionQueryKeys.listsRoot },
		(data) => {
			if (!data) return data;
			if (options.moveToFront) {
				const discussion = data.pages
					.flatMap((page) => page.discussions)
					.find((item) => item.id === discussionId);
				return discussion
					? upsertDiscussionInInfiniteData(data, updater(discussion), false)
					: data;
			}

			return {
				...data,
				pages: data.pages.map((page) => ({
					...page,
					discussions: page.discussions.map((discussion) =>
						discussion.id === discussionId
							? updater(discussion)
							: discussion,
					),
				})),
			};
		},
	);
};

const removeDiscussionFromCache = (
	queryClient: QueryClient,
	discussionId: string,
) => {
	queryClient.setQueriesData<InfiniteData<DiscussionsResponse>>(
		{ queryKey: discussionQueryKeys.listsRoot },
		(data) =>
			data && {
				...data,
				pages: data.pages.map((page) => ({
					...page,
					discussions: page.discussions.filter(
						(discussion) => discussion.id !== discussionId,
					),
				})),
			},
	);
	queryClient.removeQueries({
		queryKey: discussionQueryKeys.detail(discussionId),
		exact: true,
	});
	queryClient.removeQueries({
		queryKey: discussionQueryKeys.messagesRoot(discussionId),
	});
	queryClient.removeQueries({
		queryKey: discussionQueryKeys.mediaRoot(discussionId),
	});
};

export {
	removeDiscussionFromCache,
	updateDiscussionInCache,
	upsertDiscussionInCache,
};
