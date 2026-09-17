import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys";
import type { Post } from "../common/post";
import { postListQueryKeys } from "../common/post-list.query-keys";
import { postDetailsQueryKeys } from "../post-detail/post-detail.query-keys";

type PostListPage = {
	posts: Post[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: { id: string; createdAt: string } | null;
	};
};

export type CreatePostInput = {
	text: string;
	medias?: any[];
};

type CreatedPostResponse = {
	message: string;
	post: Post;
};

const createPost = async (input: CreatePostInput): Promise<Post> => {
	const formData = new FormData();
	if (input.text) {
		formData.append("text", input.text);
	}
	if (input.medias && input.medias.length > 0) {
		for (const file of input.medias) {
			formData.append("medias", file as any);
		}
	}

	const response = await httpClient
		.post("posts", {
			body: formData,
		})
		.json<CreatedPostResponse>();

	return response.post;
};

const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPost,
		onSuccess: (post) => {
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.feedFollowing(),
			});
			queryClient.invalidateQueries({
				queryKey: postListQueryKeys.userPosts(post.author.id),
			});
			queryClient.setQueryData(postDetailsQueryKeys.build(post.id), { post });
			queryClient.setQueriesData<{ user: any }>(
				{ queryKey: userDetailsQueryKeys.root },
				(data) =>
					data?.user?.id === post.author.id
						? {
								...data,
								user: {
									...data.user,
									postCount: (data.user.postCount ?? 0) + 1,
								},
							}
						: data,
			);
		},
	});
};

export { useCreatePost };
