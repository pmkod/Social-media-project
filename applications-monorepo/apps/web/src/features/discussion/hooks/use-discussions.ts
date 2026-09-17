import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { discussionQueryKeys } from "../common/discussion.query-keys.ts";
import type {
	DiscussionsCursor,
	DiscussionsResponse,
} from "../common/discussion.ts";

const useDiscussions = (limit = 25) =>
	useInfiniteQuery({
		queryKey: discussionQueryKeys.list(limit),
		queryFn: ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: String(limit) });
			if (pageParam) {
				searchParams.set("cursorActivityAt", pageParam.activityAt);
				searchParams.set("cursorId", pageParam.id);
			}

			return httpClient
				.get("discussions", { searchParams })
				.json<DiscussionsResponse>();
		},
		initialPageParam: null as DiscussionsCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});

export { useDiscussions };
