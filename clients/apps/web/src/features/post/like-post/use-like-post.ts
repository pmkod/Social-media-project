import {
	useMutation,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

export type LikePostResponse = {
	success: boolean;
	message: string;
	post: Post;
};
export const useLikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (postId: string) =>
			await httpClient.post(`posts/${postId}/likes`).json<LikePostResponse>(),

		onSuccess: (data, postId) => {
			queryClient.setQueriesData<InfiniteData<{ posts: Post[] }>>(
				{ queryKey: postListQueryKeys.root, exact: false },
				(oldData) => {
					if (!oldData) return undefined;
					return {
						...oldData,
						pages: oldData.pages.map((page) => ({
							...page,

							posts: page.posts.map((post) =>
								post.id === data.post.id
									? {
											...post,
											likesCount: data.post.likesCount,
											isLikedByAuthenticatedUser: true,
										}
									: post,
							),
						})),
					};
				},
			);

			queryClient.setQueryData<{ post: Post }>(
				postDetailsQueryKey.build(postId),
				(oldData) => {
					return oldData !== undefined
						? {
								...oldData,
								post: {
									...oldData.post,
									likesCount: data.post.likesCount,
									isLikedByAuthenticatedUser: true,
								},
							}
						: oldData;
				},
			);
		},
	});
};
