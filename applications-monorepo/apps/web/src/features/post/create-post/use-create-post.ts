import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import type { UserProfileResponse } from "@/features/user/user-profile/user-profile-response.ts";
import type { Post } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";
import { postDetailsQueryKeys } from "../post-detail/post-detail.query-keys.ts";

type PostListPage = {
	posts: Post[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: { id: string; createdAt: string } | null;
	};
};

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
				(data) => {
					if (!data?.pages.length) return data;
					const posts = [
						post,
						...data.pages
							.flatMap((page) => page.posts)
							.filter((item) => item.id !== post.id),
					];
					const capacity = data.pages.reduce(
						(total, page) => total + page.pagination.limit,
						0,
					);
					const serverHasMore =
						Boolean(data.pages.at(-1)?.pagination.hasNextPage) ||
						posts.length > capacity;
					const retainedPosts = posts.slice(0, capacity);
					let offset = 0;

					return {
						...data,
						pages: data.pages.map((page, index) => {
							const pagePosts = retainedPosts.slice(
								offset,
								offset + page.pagination.limit,
							);
							offset += page.pagination.limit;
							const lastPost = pagePosts.at(-1);
							const hasNextPage =
								index < data.pages.length - 1 || serverHasMore;
							return {
								...page,
								posts: pagePosts,
								pagination: {
									...page.pagination,
									hasNextPage,
									nextCursor:
										hasNextPage && lastPost
											? { id: lastPost.id, createdAt: lastPost.createdAt }
											: null,
								},
							};
						}),
					};
				},
			);
			queryClient.setQueryData<InfiniteData<PostListPage>>(
				postListQueryKeys.userPosts(post.author.id),
				(data) => {
					if (!data?.pages.length) return data;
					const posts = [
						post,
						...data.pages
							.flatMap((page) => page.posts)
							.filter((item) => item.id !== post.id),
					];
					const capacity = data.pages.reduce(
						(total, page) => total + page.pagination.limit,
						0,
					);
					const serverHasMore =
						Boolean(data.pages.at(-1)?.pagination.hasNextPage) ||
						posts.length > capacity;
					const retainedPosts = posts.slice(0, capacity);
					let offset = 0;

					return {
						...data,
						pages: data.pages.map((page, index) => {
							const pagePosts = retainedPosts.slice(
								offset,
								offset + page.pagination.limit,
							);
							offset += page.pagination.limit;
							const lastPost = pagePosts.at(-1);
							const hasNextPage =
								index < data.pages.length - 1 || serverHasMore;
							return {
								...page,
								posts: pagePosts,
								pagination: {
									...page.pagination,
									hasNextPage,
									nextCursor:
										hasNextPage && lastPost
											? { id: lastPost.id, createdAt: lastPost.createdAt }
											: null,
								},
							};
						}),
					};
				},
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
				(data) => {
					if (!data?.pages.length) return data;
					const posts = [
						post,
						...data.pages
							.flatMap((page) => page.posts)
							.filter((item) => item.id !== post.id),
					];
					const capacity = data.pages.reduce(
						(total, page) => total + page.pagination.limit,
						0,
					);
					const serverHasMore =
						Boolean(data.pages.at(-1)?.pagination.hasNextPage) ||
						posts.length > capacity;
					const retainedPosts = posts.slice(0, capacity);
					let offset = 0;

					return {
						...data,
						pages: data.pages.map((page, index) => {
							const pagePosts = retainedPosts.slice(
								offset,
								offset + page.pagination.limit,
							);
							offset += page.pagination.limit;
							const lastPost = pagePosts.at(-1);
							const hasNextPage =
								index < data.pages.length - 1 || serverHasMore;
							return {
								...page,
								posts: pagePosts,
								pagination: {
									...page.pagination,
									hasNextPage,
									nextCursor:
										hasNextPage && lastPost
											? { id: lastPost.id, createdAt: lastPost.createdAt }
											: null,
								},
							};
						}),
					};
				},
			);
			queryClient.setQueryData(postDetailsQueryKeys.build(post.id), { post });
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
