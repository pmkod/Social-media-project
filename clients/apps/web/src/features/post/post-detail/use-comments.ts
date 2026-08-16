import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import { postDetailsQueryKey } from "./post-detail.query-key.ts";

type ApiComment = {
	id: string;
	postId: string;
	authorId?: string;
	content: string;
	likesCount?: number;
	createdAt: string;
	updatedAt?: string;
};

export type CommentsResponse = {
	data: ApiComment[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
};

export type CommentsInfiniteResult = {
	data: Comment[];
	pagination: CommentsResponse["pagination"];
};

export type GetCommentsResponse = CommentsResponse;
export type GetCommentsInfiniteResult = CommentsInfiniteResult;

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

const mapComment = (raw: ApiComment): Comment => ({
	id: raw.id,
	postId: raw.postId,
	author: DEFAULT_AUTHOR,
	content: raw.content,
	createdAt: formatDate(raw.createdAt),
	likesCount: raw.likesCount ?? 0,
});

export const fetchCommentsPage = async ({
	postId,
	pageParam = 1,
}: {
	postId: string;
	pageParam?: number;
}): Promise<CommentsInfiniteResult> => {
	const res = await httpClient
		.get(`posts/${postId}/comments`, {
			searchParams: {
				page: pageParam.toString(),
				limit: "10",
			},
		})
		.json<CommentsResponse>();

	return {
		data: (res.data ?? []).map(mapComment),
		pagination: res.pagination,
	};
};

export const useComments = (postId: string, enabled = true) => {
	return useInfiniteQuery({
		queryKey: postDetailsQueryKey.buildComments(postId),
		queryFn: ({ pageParam }) => fetchCommentsPage({ postId, pageParam }),
		initialPageParam: 1,
		enabled: enabled && Boolean(postId),
		getNextPageParam: (lastPage) => {
			if (lastPage.pagination.page < lastPage.pagination.totalPages) {
				return lastPage.pagination.page + 1;
			}
			return undefined;
		},
	});
};
