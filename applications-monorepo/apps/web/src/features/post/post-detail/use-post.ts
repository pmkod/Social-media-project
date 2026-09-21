import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { postDetailsQueryKeys } from "./post-detail.query-keys.ts";

type UsePostParams = {
	postId: string;
};

export const usePost = ({ postId }: UsePostParams) => {
	return useQuery({
		queryKey: postDetailsQueryKeys.build(postId),
		queryFn: async () =>
			await httpClient.get(`content/get-post-by-id/${postId}`).json<{ post: Post }>(),
		enabled: Boolean(postId),
	});
};
