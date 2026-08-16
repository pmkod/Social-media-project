import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "@/features/post/common/post.ts";
import { postListQueryKeys } from "@/features/post/common/post-list.query-keys.ts";

type BookmarksCursor = { id: string; createdAt: string };
type BookmarksResponse = {
	posts: Post[];
	pagination: {
		nextCursor: BookmarksCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

const useBookmarks = (
	collectionId?: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useInfiniteQuery({
		queryKey: collectionId
			? postListQueryKeys.collectionPosts(collectionId)
			: postListQueryKeys.bookmarks(),
		queryFn: async ({ pageParam }) => {
			const searchParams = new URLSearchParams({ limit: "10" });
			if (pageParam) {
				searchParams.set("cursorId", pageParam.id);
				searchParams.set("cursorCreatedAt", pageParam.createdAt);
			}
			return httpClient
				.get(collectionId ? `collections/${collectionId}/posts` : "bookmarks", {
					searchParams,
				})
				.json<BookmarksResponse>();
		},
		initialPageParam: null as BookmarksCursor | null,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
		enabled,
	});

export { useBookmarks };
