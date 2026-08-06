import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import type { PostMediaItem } from "../common/post.ts";

type ApiComment = {
	id: string;
	postId: string;
	authorId?: string;
	content: string;
	createdAt: string;
	updatedAt?: string;
	medias?: PostMediaItem[];
	_count?: {
		commentLikes: number;
	};
};

type GetCommentsResponse = {
	data: ApiComment[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type GetCommentsInfiniteResult = {
	data: Comment[];
	meta: GetCommentsResponse["meta"];
};

const DEFAULT_AUTHOR = {
	name: "Utilisateur",
	handle: "utilisateur",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

const MOCK_COMMENTS: Record<string, Comment[]> = {};

const formatDate = (value: string) =>
	new Date(value).toLocaleDateString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
	});

const mapComment = (raw: ApiComment): Comment => ({
	id: raw.id,
	postId: raw.postId,
	author: DEFAULT_AUTHOR,
	content: raw.content,
	createdAt: formatDate(raw.createdAt),
	medias: raw.medias ?? [],
	likesCount: raw._count?.commentLikes ?? 0,
});

const fetchCommentsPage = async ({
	postId,
	pageParam = 1,
}: {
	postId: string;
	pageParam?: number;
}): Promise<GetCommentsInfiniteResult> => {
	try {
		const res = await httpClient
			.get(`posts/${postId}/comments`, {
				searchParams: {
					page: pageParam.toString(),
					limit: "10",
				},
			})
			.json<GetCommentsResponse>();

		return {
			data: (res.data ?? []).map(mapComment),
			meta: res.meta,
		};
	} catch {
		const mockComments = MOCK_COMMENTS[postId] ?? [];
		const limit = 10;
		const start = (pageParam - 1) * limit;
		const pageComments = mockComments.slice(start, start + limit);

		return {
			data: pageComments,
			meta: {
				total: mockComments.length,
				page: pageParam,
				limit,
				totalPages: Math.max(1, Math.ceil(mockComments.length / limit)),
			},
		};
	}
};

export const useGetComments = (postId: string, enabled = true) => {
	return useInfiniteQuery({
		queryKey: ["posts", postId, "comments"],
		queryFn: ({ pageParam }) => fetchCommentsPage({ postId, pageParam }),
		initialPageParam: 1,
		enabled: enabled && Boolean(postId),
		getNextPageParam: (lastPage) => {
			if (lastPage.meta.page < lastPage.meta.totalPages) {
				return lastPage.meta.page + 1;
			}
			return undefined;
		},
	});
};
