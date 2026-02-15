import { httpClient } from "@/core/services/http.client";
import { useQuery } from "@tanstack/react-query";
import { postQueryKeys } from "../post.query-keys";
import type { GetPostsFilters } from "../types/get-posts-filters";
import type { Post } from "../types/post";

type UserPostQueryParams = {
	filters: GetPostsFilters;
};

type UsePostsQueryData = {
	posts: Post[];
};

const usePosts = (params?: UserPostQueryParams) => {
	return useQuery({
		queryKey: postQueryKeys.getPosts(params?.filters).queryKey,
		queryFn: () => {
			return httpClient.get("posts").json<UsePostsQueryData>();
		},
	});
};

export { usePosts };
