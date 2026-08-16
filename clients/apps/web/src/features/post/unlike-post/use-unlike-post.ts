import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import {
	updatePostInQueryData,
	updatePostLikeState,
} from "../common/post-like.cache-utils.ts";
import type { Post } from "../common/post.ts";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

export type UnlikePostResponse = {
	success: boolean;
	message: string;
	likesCount: number;
};

export const unlikePostApi = async (
	postId: string,
): Promise<UnlikePostResponse> => {
	return await httpClient
		.delete(`posts/${postId}/likes`)
		.json<UnlikePostResponse>();
};

export const useUnlikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (postId: string) => unlikePostApi(postId),
		onMutate: async (postId: string) => {
			await queryClient.cancelQueries({ queryKey: postListQueryKeys.root });

			const previousQueries = queryClient.getQueriesData({
				queryKey: postListQueryKeys.root,
			});

			queryClient.setQueriesData(
				{ queryKey: postListQueryKeys.root },
				(oldData) => updatePostInQueryData(oldData, postId, false),
			);

			queryClient.setQueryData(
				postDetailsQueryKey.build(postId),
				(oldPost: Post | undefined) =>
					oldPost ? updatePostLikeState(oldPost, false) : oldPost,
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
						updatePostInQueryData(oldData, postId, false, data.likesCount),
				);

				queryClient.setQueryData(
					postDetailsQueryKey.build(postId),
					(oldPost: Post | undefined) =>
						oldPost
							? updatePostLikeState(oldPost, false, data.likesCount)
							: oldPost,
				);
			}
		},
	});
};
