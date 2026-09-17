import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type { DiscussionMediaResponse } from "../common/discussion.ts";

const useDiscussionMedia = (discussionId: string, limit = 30) =>
	useInfiniteQuery({
		queryKey: discussionQueryKeys.media(discussionId, limit),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (pageParam) {
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
				searchParams.set("cursorId", pageParam.id);
			}
			return httpClient
				.get(`discussions/${discussionId}/media`, { searchParams })
				.json<DiscussionMediaResponse>();
		},
		initialPageParam: null as { createdAt: string; id: string } | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled: Boolean(discussionId),
	});

export { useDiscussionMedia };
