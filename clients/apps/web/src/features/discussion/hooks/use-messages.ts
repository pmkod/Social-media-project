import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type { MessagesCursor, MessagesResponse } from "../common/discussion.ts";

const useMessages = (discussionId: string, limit = 30) =>
	useInfiniteQuery({
		queryKey: discussionQueryKeys.messages(discussionId, limit),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (pageParam) {
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
				searchParams.set("cursorId", pageParam.id);
			}

			return httpClient
				.get(`discussions/${discussionId}/messages`, { searchParams })
				.json<MessagesResponse>();
		},
		initialPageParam: null as MessagesCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(discussionId),
	});

export { useMessages };
