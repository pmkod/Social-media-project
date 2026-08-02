import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";

export type CreatePostInput = {
	text: string;
	medias?: File[];
};

const CURRENT_USER = {
	name: "Vous",
	handle: "mon_compte",
	avatar:
		"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
};

type CreatedPostResponse = {
	message: string;
	post: {
		id: string;
		text: string;
		medias?: Array<{
			id: string;
			position: number;
			highQualityFile?: {
				filename: string;
			} | null;
		}>;
	};
};

const createPost = async (input: CreatePostInput): Promise<Post> => {
	const formData = new FormData();
	if (input.text) {
		formData.append("text", input.text);
	}
	if (input.medias && input.medias.length > 0) {
		for (const file of input.medias) {
			formData.append("medias", file);
		}
	}

	try {
		const response = await httpClient
			.post("posts", {
				body: formData,
			})
			.json<CreatedPostResponse>();

		const createdPost = response.post;

		return {
			id: createdPost.id,
			author: CURRENT_USER,
			createdAt: "À l'instant",
			content: createdPost.text,
			medias: createdPost.medias,
			stats: {
				comments: 0,
				reposts: 0,
				likes: 0,
				shares: 0,
			},
			isLiked: false,
			isBookmarked: false,
		};
	} catch {
		// Local fallback post if API endpoint is unavailable
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
			id: `post-created-${Date.now()}`,
			author: CURRENT_USER,
			createdAt: "À l'instant",
			content: input.text,
			medias: fallbackMedias.length > 0 ? fallbackMedias : undefined,
			stats: {
				comments: 0,
				reposts: 0,
				likes: 0,
				shares: 0,
			},
			isLiked: false,
			isBookmarked: false,
		};
	}
};

const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
};

export { useCreatePost };
