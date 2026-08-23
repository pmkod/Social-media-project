import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { postDetailsQueryKey } from "./post-detail.query-key.ts";

type UsePostParams = {
	postId: string;
};

export const usePost = ({ postId }: UsePostParams) => {
	return useQuery({
		queryKey: postDetailsQueryKey.build(postId),
		queryFn: async () =>
			await httpClient.get(`posts/${postId}`).json<{ post: Post }>(),
		enabled: Boolean(postId),
	});
};
