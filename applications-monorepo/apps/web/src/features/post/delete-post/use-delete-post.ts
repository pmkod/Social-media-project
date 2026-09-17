import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { bookmarkCollectionsQueryKeys } from "@/features/bookmark/common/bookmark-collections.query-keys.ts";
import { commentListQueryKeys } from "@/features/comment/common/comment-list.query-keys.ts";
import { authenticatedUserQueryKey } from "@/features/user/authenticated-user/authenticated-user.query-key.ts";
import type { UseAuthenticatedUserQueryData } from "@/features/user/authenticated-user/types/use-authenticated-user-query-data.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import type { UserProfileResponse } from "@/features/user/user-profile/user-profile-response.ts";
import * as m from "@/paraglide/messages.js";
import type { Post } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";
import { postDetailsQueryKeys } from "../post-detail/post-detail.query-keys.ts";

type PostListPage = { posts: Post[] };

const decrementPostCount = <T extends UserProfileResponse>(
	data: T | undefined,
	authorId: string,
): T | undefined =>
	data?.user.id === authorId
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
			httpClient.delete(`posts/${post.id}`).json<{ message: string }>(),
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

			queryClient.setQueriesData<UserProfileResponse>(
				{ queryKey: userDetailsQueryKeys.root },
				(data) => decrementPostCount(data, post.author.id),
			);
			queryClient.setQueryData<UseAuthenticatedUserQueryData>(
				authenticatedUserQueryKey,
				(data) => decrementPostCount(data, post.author.id),
			);

			// Soft-deleted posts no longer count as visible collection items.
			void queryClient.invalidateQueries({
				queryKey: bookmarkCollectionsQueryKeys.root,
			});
			toast.success(m.post_delete_success());
		},
		onError: (error) => {
			toast.error(error.message || m.post_delete_error());
		},
	});
};

export { useDeletePost };
