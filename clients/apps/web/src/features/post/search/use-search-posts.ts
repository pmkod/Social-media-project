import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post, PostType } from "../common/post.ts";
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
	type,
	pageParam,
}: {
	query: string;
	type: PostType;
	pageParam?: SearchCursor | null;
}) => {
	const searchParams = new URLSearchParams({ q: query, limit: "10", type });
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
	type?: PostType;
	enabled?: boolean;
};

const useSearchPosts = ({
	query,
	type = "POST",
	enabled = true,
}: UseSearchPostsParams) => {
	const normalizedQuery = query.trim();

	return useInfiniteQuery({
		queryKey: postListQueryKeys.search(normalizedQuery, type),
		enabled,
		queryFn: ({ pageParam }) =>
			fetchSearchPostsPage({ query: normalizedQuery, type, pageParam }),
		initialPageParam: null as SearchCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});
};

export { useSearchPosts };
