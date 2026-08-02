import { useMutation } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";

export type CreatePostInput = {
	text: string;
	mediaUrls: string[];
};

const CURRENT_USER = {
	name: "Vous",
	handle: "mon_compte",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

type CreatedPostResponse = {
	id: string;
	authorId: string;
	text: string;
	mediaUrls: string[];
	createdAt: string;
	updatedAt: string;
};

const createPost = async (input: CreatePostInput): Promise<Post> => {
	const response = await httpClient
		.post("posts", {
			json: {
				text: input.text,
				mediaUrls: input.mediaUrls,
			},
		})
		.json<CreatedPostResponse>();

	return {
		id: response.id,
		author: CURRENT_USER,
		createdAt: "À l'instant",
		content: response.text,
		images: response.mediaUrls.length > 0 ? response.mediaUrls : undefined,
		stats: {
			comments: 0,
			reposts: 0,
			likes: 0,
			shares: 0,
		},
		isLiked: false,
		isBookmarked: false,
	};
};

const useCreatePost = () => {
	return useMutation({
		mutationFn: createPost,
	});
};

export { useCreatePost };
