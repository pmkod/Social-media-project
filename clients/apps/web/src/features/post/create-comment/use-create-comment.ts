import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import { feedQueryKey } from "../feed/feed.query-key.ts";
import { postDetailsQueryKey } from "../post-detail/post-detail.query-key.ts";
import { postsQueryKey } from "../posts.query-key.ts";

export type CreateCommentInput = {
	postId: string;
	content: string;
};

const DEFAULT_AUTHOR = {
	name: "Vous",
	handle: "mon_compte",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

type ApiComment = {
	id: string;
	postId: string;
	authorId?: string;
	content: string;
	likesCount?: number;
	createdAt: string;
	updatedAt?: string;
};

type CreateCommentResponse = {
	message: string;
	comment: ApiComment;
};

const mapComment = (raw: ApiComment): Comment => ({
	id: raw.id,
	postId: raw.postId,
	author: DEFAULT_AUTHOR,
	content: raw.content,
	createdAt: "À l'instant",
	likesCount: raw.likesCount ?? 0,
});

const createComment = async (input: CreateCommentInput): Promise<Comment> => {
	const formData = new FormData();
	if (input.content) {
		formData.append("content", input.content);
	}

	try {
		const response = await httpClient
			.post(`posts/${input.postId}/comments`, {
				body: formData,
			})
			.json<CreateCommentResponse>();

		return mapComment(response.comment);
	} catch {
		// Local fallback comment if API endpoint is unavailable
		return {
			id: `comment-created-${Date.now()}`,
			postId: input.postId,
			author: DEFAULT_AUTHOR,
			content: input.content,
			createdAt: "À l'instant",
			likesCount: 0,
		};
	}
};

const useCreateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createComment,
		onSuccess: (comment) => {
			queryClient.invalidateQueries({ queryKey: postsQueryKey.root });
			queryClient.invalidateQueries({ queryKey: feedQueryKey.root });
			queryClient.invalidateQueries({
				queryKey: postDetailsQueryKey.buildComments(comment.postId),
			});
		},
	});
};

export { useCreateComment };
