import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { bookmarkCollectionsQueryKeys } from "@/features/bookmark/common/bookmark-collections.query-keys";
import { commentListQueryKeys } from "@/features/comment/common/comment-list.query-keys";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key";
import type { UseAuthenticatedUserQueryData } from "@/features/user/authenticated-user/types/use-authenticated-user-query-data";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys";
import type { Post } from "../common/post";
import { postListQueryKeys } from "../common/post-list.query-keys";
import { postDetailsQueryKeys } from "../post-detail/post-detail.query-keys";

type PostListPage = { posts: Post[] };

const decrementPostCount = <T extends { user: any }>(
	data: T | undefined,
	authorId: string,
): T | undefined =>
	data?.user?.id === authorId
		? {
				...data,
				user: {
					...data.user,
					postCount: Math.max(0, (data.user.postCount ?? 0) - 1),
				},
			}
		: data;

const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (post: Post) =>
			httpClient.delete(`content/delete-post/${post.id}`).json<{ message: string }>(),
		onSuccess: (_, post) => {
			queryClient.setQueriesData<InfiniteData<PostListPage>>(
				{ queryKey: postListQueryKeys.root },
				(data) =>
					data && {
						...data,
						pages: data.pages.map((page) => ({
							...page,
							posts: page.posts.filter(
								(cachedPost) => cachedPost.id !== post.id,
							),
						})),
					},
			);

			queryClient.removeQueries({
				queryKey: postDetailsQueryKeys.build(post.id),
				exact: true,
			});
			queryClient.removeQueries({
				queryKey: commentListQueryKeys.root,
				predicate: ({ queryKey }) =>
					(queryKey[1] as { postId?: string } | undefined)?.postId === post.id,
			});

			queryClient.setQueriesData<{ user: any }>(
				{ queryKey: userDetailsQueryKeys.root },
				(data) => decrementPostCount(data, post.author.id),
			);
			queryClient.setQueryData<UseAuthenticatedUserQueryData>(
				authenticatedUserQueryKey,
				(data) => decrementPostCount(data, post.author.id),
			);

			void queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
		},
	});
};

export { useDeletePost };
