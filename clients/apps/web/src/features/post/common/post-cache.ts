import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";
import { postListQueryKeys } from "./post-list.query-keys.ts";
import type { Post } from "./post.ts";

type PostListPage = {
	posts: Post[];
	pagination: {
		limit: number;
		hasNextPage: boolean;
		nextCursor: { id: string; createdAt: string } | null;
	};
};

const updatePostInCache = (
	queryClient: QueryClient,
	postId: string,
	updater: (post: Post) => Post,
) => {
	queryClient.setQueriesData<InfiniteData<PostListPage>>(
		{ queryKey: postListQueryKeys.root },
		(data) =>
			data && {
				...data,
				pages: data.pages.map((page) => ({
					...page,
					posts: page.posts.map((post) =>
						post.id === postId ? updater(post) : post,
					),
				})),
			},
	);

	queryClient.setQueryData<{ post: Post }>(
		postDetailsQueryKey.build(postId),
		(data) =>
			data ? { ...data, post: updater(data.post) } : data,
	);
};

const prependPostToInfiniteData = (
	data: InfiniteData<PostListPage> | undefined,
	post: Post,
) => {
	if (!data?.pages.length) return data;

	const previousPosts = data.pages
		.flatMap((page) => page.posts)
		.filter((item) => item.id !== post.id);
	const posts = [post, ...previousPosts];
	const capacity = data.pages.reduce(
		(total, page) => total + page.pagination.limit,
		0,
	);
	const previousLastPage = data.pages.at(-1);
	const serverHasMore =
		Boolean(previousLastPage?.pagination.hasNextPage) || posts.length > capacity;
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
};

export { prependPostToInfiniteData, updatePostInCache };
export type { PostListPage };
