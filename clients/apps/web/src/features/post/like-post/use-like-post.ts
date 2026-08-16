import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import {
	updatePostInQueryData,
	updatePostLikeState,
} from "../common/post-like.cache-utils.ts";
import type { Post } from "../common/post.ts";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

export type LikePostResponse = {
	success: boolean;
	message: string;
	likesCount: number;
};

export const likePostApi = async (
	postId: string,
): Promise<LikePostResponse> => {
	return await httpClient
		.post(`posts/${postId}/likes`)
		.json<LikePostResponse>();
};

export const useLikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (postId: string) => likePostApi(postId),
		onMutate: async (postId: string) => {
			await queryClient.cancelQueries({ queryKey: postListQueryKeys.root });

			const previousQueries = queryClient.getQueriesData({
				queryKey: postListQueryKeys.root,
			});

			queryClient.setQueriesData(
				{ queryKey: postListQueryKeys.root },
				(oldData) => updatePostInQueryData(oldData, postId, true),
			);

			queryClient.setQueryData(
				postDetailsQueryKey.build(postId),
				(oldPost: Post | undefined) =>
					oldPost ? updatePostLikeState(oldPost, true) : oldPost,
			);

			return { previousQueries };
		},
		onError: (_err, _postId, context) => {
			if (context?.previousQueries) {
				for (const [queryKey, data] of context.previousQueries) {
					queryClient.setQueryData(queryKey, data);
				}
			}
		},
		onSuccess: (data, postId) => {
			if (typeof data?.likesCount === "number") {
				queryClient.setQueriesData(
					{ queryKey: postListQueryKeys.root },
					(oldData) =>
						updatePostInQueryData(oldData, postId, true, data.likesCount),
				);

				queryClient.setQueryData(
					postDetailsQueryKey.build(postId),
					(oldPost: Post | undefined) =>
						oldPost
							? updatePostLikeState(oldPost, true, data.likesCount)
							: oldPost,
				);
			}
		},
	});
};
