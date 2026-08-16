import { useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";
import type { Post } from "../common/post.ts";
import type { FollowingFeedResponse } from "../feed/use-following-feed.ts";
import { postDetailsQueryKey } from "./post-detail.query-key.ts";

const fetchPostById = async (postId: string): Promise<Post> => {
	return await httpClient.get(`posts/${postId}`).json<Post>();
};

export const usePost = (postId: string) => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: postDetailsQueryKey.build(postId),
		queryFn: async () => {
			try {
				return await fetchPostById(postId);
			} catch (error) {
				// Check if the post is already loaded in the following feed query cache
				const feedData = queryClient.getQueryData<{
					pages: FollowingFeedResponse[];
				}>(postListQueryKeys.feedFollowing());

				if (feedData) {
					for (const page of feedData.pages) {
						const found = page.posts.find((p) => p.id === postId);
						if (found) return found;
					}
				}

				throw error;
			}
		},
		enabled: Boolean(postId),
	});
};

export const usePostById = usePost;
