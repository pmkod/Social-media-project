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
		.get("posts/search", { searchParams })
		.json<SearchPostsResponse>();
};

type UseSearchPostsParams = {
	query: string;
};

const useSearchPosts = ({ query }: UseSearchPostsParams) =>
	useInfiniteQuery({
		queryKey: postListQueryKeys.search(query),
		queryFn: ({ pageParam }) => fetchSearchPostsPage({ query, pageParam }),
		initialPageParam: null as SearchCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
	});

export { useSearchPosts };
