import type { Post } from "./post.ts";

export function updatePostLikeState(
	post: Post,
	isLiked: boolean,
	explicitLikesCount?: number,
): Post {
	const currentLikes = post.likesCount ?? 0;
	const nextLikesCount =
		typeof explicitLikesCount === "number"
			? explicitLikesCount
			: Math.max(0, isLiked ? currentLikes + 1 : currentLikes - 1);

	return {
		...post,
		isLikedByAuthenticatedUser: isLiked,
		likesCount: nextLikesCount,
	};
}

export function updatePostInQueryData(
	oldData: unknown,
	postId: string,
	isLiked: boolean,
	explicitLikesCount?: number,
): unknown {
	if (!oldData) return oldData;

	// 1. Infinite Data: { pages: Array<{ posts: Post[] }>, pageParams: ... }
	if (
		typeof oldData === "object" &&
		"pages" in (oldData as Record<string, unknown>)
	) {
		const infiniteData = oldData as {
			pages: Array<unknown>;
			pageParams: unknown[];
		};
		if (Array.isArray(infiniteData.pages)) {
			return {
				...infiniteData,
				pages: infiniteData.pages.map((page) => {
					if (
						page &&
						typeof page === "object" &&
						"posts" in (page as Record<string, unknown>)
					) {
						const pageObj = page as { posts: Post[]; [key: string]: unknown };
						if (Array.isArray(pageObj.posts)) {
							return {
								...pageObj,
								posts: pageObj.posts.map((p) =>
									p.id === postId
										? updatePostLikeState(p, isLiked, explicitLikesCount)
										: p,
								),
							};
						}
					}
					return page;
				}),
			};
		}
	}

	// 2. Object with posts array: { posts: Post[] }
	if (
		typeof oldData === "object" &&
		"posts" in (oldData as Record<string, unknown>)
	) {
		const obj = oldData as { posts: Post[]; [key: string]: unknown };
		if (Array.isArray(obj.posts)) {
			return {
				...obj,
				posts: obj.posts.map((p) =>
					p.id === postId
						? updatePostLikeState(p, isLiked, explicitLikesCount)
						: p,
				),
			};
		}
	}

	// 3. Simple Array: Post[]
	if (Array.isArray(oldData)) {
		return oldData.map((p: Post) =>
			p && typeof p === "object" && p.id === postId
				? updatePostLikeState(p, isLiked, explicitLikesCount)
				: p,
		);
	}

	return oldData;
}
