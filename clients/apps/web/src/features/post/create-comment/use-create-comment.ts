import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Comment } from "../common/comment.ts";
import type { PostMediaItem } from "../common/post.ts";

export type CreateCommentInput = {
	postId: string;
	content: string;
	medias?: File[];
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
	createdAt: string;
	updatedAt?: string;
	medias?: PostMediaItem[];
	_count?: {
		commentLikes: number;
	};
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
	medias: raw.medias ?? [],
	likesCount: raw._count?.commentLikes ?? 0,
});

const createComment = async (input: CreateCommentInput): Promise<Comment> => {
	const formData = new FormData();
	if (input.content) {
		formData.append("content", input.content);
	}
	if (input.medias && input.medias.length > 0) {
		for (const file of input.medias) {
			formData.append("medias", file);
		}
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
		const fallbackMedias = (input.medias || []).map((file, idx) => {
			const isVideo = file.type.startsWith("video/");
			const url = URL.createObjectURL(file);
			return {
				id: `temp-${idx}`,
				mediaType: isVideo ? "VIDEO" : "IMAGE",
				highQualityFile: {
					filename: url,
				},
			};
		});

		return {
			id: `comment-created-${Date.now()}`,
			postId: input.postId,
			author: DEFAULT_AUTHOR,
			content: input.content,
			createdAt: "À l'instant",
			medias: fallbackMedias.length > 0 ? fallbackMedias : [],
			likesCount: 0,
		};
	}
};

const useCreateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createComment,
		onSuccess: (comment) => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({
				queryKey: ["posts", comment.postId, "comments"],
			});
		},
	});
};

export { useCreateComment };
