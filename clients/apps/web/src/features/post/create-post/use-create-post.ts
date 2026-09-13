import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import type { UserProfileResponse } from "@/features/user/user-profile/user-profile-response.ts";
import {
	prependPostToInfiniteData,
	type PostListPage,
} from "../common/post-cache.ts";
import type { Post } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";

type CreatePostInput = {
	text: string;
	medias?: File[];
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
			formData.append("medias", file);
		}
	}

	const response = await httpClient
		.post("posts", {
			body: formData,
			timeout: 120_000,
		})
		.json<CreatedPostResponse>();

	return response.post;
};

const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPost,
		onSuccess: (post) => {
			queryClient.setQueryData<InfiniteData<PostListPage>>(
				postListQueryKeys.feedFollowing(),
				(data) => prependPostToInfiniteData(data, post),
			);
			queryClient.setQueryData<InfiniteData<PostListPage>>(
				postListQueryKeys.userPosts(post.author.id),
				(data) => prependPostToInfiniteData(data, post),
			);
			queryClient.setQueriesData<InfiniteData<PostListPage>>(
				{
					queryKey: postListQueryKeys.root,
					predicate: ({ queryKey }) => {
						if (queryKey[1] !== "search") return false;
						const query = String(queryKey[2] ?? "").toLocaleLowerCase();
						return (post.text ?? "").toLocaleLowerCase().includes(query);
					},
				},
				(data) => prependPostToInfiniteData(data, post),
			);
			queryClient.setQueryData(postDetailsQueryKey.build(post.id), { post });
			queryClient.setQueriesData<UserProfileResponse>(
				{ queryKey: userDetailsQueryKeys.root },
				(data) =>
					data?.user.id === post.author.id
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
