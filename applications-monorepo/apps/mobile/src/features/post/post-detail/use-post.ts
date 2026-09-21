import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import type { Post } from "../common/post";
import { postDetailsQueryKeys } from "./post-detail.query-keys";

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
