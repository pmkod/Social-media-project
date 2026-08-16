import type { Post } from "@/features/post/common/post.ts";

const updatePostBookmarkState = (post: Post, isBookmarked: boolean): Post => ({
	...post,
	isBookmarkedByAuthenticatedUser: isBookmarked,
});

const updateBookmarkInQueryData = (
	oldData: unknown,
	postId: string,
	isBookmarked: boolean,
): unknown => {
	if (!oldData) return oldData;
	if (
		typeof oldData === "object" &&
		"pages" in (oldData as Record<string, unknown>)
	) {
		const infiniteData = oldData as {
			pages: Array<{ posts?: Post[] }>;
			pageParams: unknown[];
		};
		return {
			...infiniteData,
			pages: infiniteData.pages.map((page) => ({
				...page,
				posts: page.posts?.map((post) =>
					post.id === postId
						? updatePostBookmarkState(post, isBookmarked)
						: post,
				),
			})),
		};
	}
	return oldData;
};

export { updateBookmarkInQueryData, updatePostBookmarkState };
