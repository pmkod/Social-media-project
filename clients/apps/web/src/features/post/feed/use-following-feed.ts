import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import type { Post, PostMediaItem } from "../common/post.ts";
import { feedQueryKey } from "./feed.query-key.ts";

type ApiComment = {
	id: string;
	postId?: string;
	authorId?: string;
	content: string;
	likesCount?: number;
	createdAt: string;
	updatedAt?: string;
};

type ApiPostItem = {
	id: string;
	authorId?: string;
	text: string;
	likesCount?: number;
	commentsCount?: number;
	medias?: PostMediaItem[];
	comments?: ApiComment[];
	createdAt: string;
	updatedAt?: string;
	_count?: {
		comments: number;
		postLikes: number;
	};
};

export type FeedCursor = {
	id: string;
	createdAt: string;
};

export type FollowingFeedResponse = {
	posts: ApiPostItem[];
	pagination: {
		nextCursor: FeedCursor | null;
		hasNextPage: boolean;
		limit: number;
	};
};

export type FollowingFeedInfiniteResult = {
	data: Post[];
	pagination: FollowingFeedResponse["pagination"];
};

export type GetFollowingFeedResponse = FollowingFeedResponse;
export type GetFollowingFeedInfiniteResult = FollowingFeedInfiniteResult;

const DEFAULT_AUTHOR = {
	name: "Utilisateur",
	handle: "utilisateur",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

const formatDate = (value: string) =>
	new Date(value).toLocaleDateString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});

export const fetchFollowingFeedPage = async ({
	pageParam,
}: {
	pageParam?: FeedCursor | null;
}): Promise<FollowingFeedInfiniteResult> => {
	const searchParams: Record<string, string> = {
		limit: "4",
	};

	if (pageParam?.id && pageParam?.createdAt) {
		searchParams.cursorId = pageParam.id;
		searchParams.cursorCreatedAt = pageParam.createdAt;
	}

	const res = await httpClient
		.get("feed/following", {
			searchParams,
		})
		.json<FollowingFeedResponse>();

	const rawPosts = res.posts ?? [];
	const posts: Post[] = rawPosts.map((item) => {
		const comments: Comment[] = (item.comments ?? []).map((rawComment) => ({
			id: rawComment.id,
			postId: rawComment.postId ?? item.id,
			author: DEFAULT_AUTHOR,
			content: rawComment.content,
			createdAt: formatDate(rawComment.createdAt),
			likesCount: rawComment.likesCount ?? 0,
		}));

		return {
			id: item.id,
			author: DEFAULT_AUTHOR,
			createdAt: formatDate(item.createdAt),
			content: item.text,
			medias: item.medias ?? [],
			stats: {
				comments: item.commentsCount ?? item._count?.comments ?? 0,
				reposts: 0,
				likes: item.likesCount ?? item._count?.postLikes ?? 0,
				shares: 0,
			},
			isLiked: false,
			isBookmarked: false,
			comments,
		};
	});

	return {
		data: posts,
		pagination: res.pagination,
	};
};

export const useFollowingFeed = () => {
	return useInfiniteQuery({
		queryKey: feedQueryKey.buildFollowing(),
		queryFn: ({ pageParam }) => fetchFollowingFeedPage({ pageParam }),
		initialPageParam: null as FeedCursor | null,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.nextCursor ?? undefined;
		},
	});
};
