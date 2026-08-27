import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

type SearchCursor = {
	id: string;
	createdAt: string;
};

type SearchPostsResponse = {
	posts: Post[];
	pagination: {
		nextCursor: SearchCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const fetchSearchPostsPage = async ({
	query,
	pageParam,
}: {
	query: string;
	pageParam?: SearchCursor | null;
}) => {
	const searchParams = new URLSearchParams({ q: query, limit: "10" });
	if (pageParam) {
		searchParams.set("cursorId", pageParam.id);
		searchParams.set("cursorCreatedAt", pageParam.createdAt);
	}

	return await httpClient
		.get("posts", { searchParams })
		.json<SearchPostsResponse>();
};

type UseSearchPostsParams = {
	query: string;
	enabled?: boolean;
};

const useSearchPosts = ({ query, enabled = true }: UseSearchPostsParams) => {
	const normalizedQuery = query.trim();

	return useInfiniteQuery({
		queryKey: postListQueryKeys.search(normalizedQuery),
		enabled: enabled && normalizedQuery.length > 0,
		queryFn: ({ pageParam }) =>
			fetchSearchPostsPage({ query: normalizedQuery, pageParam }),
		initialPageParam: null as SearchCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});
};

export { useSearchPosts };
