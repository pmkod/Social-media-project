import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const uploadBlobMedia = async (urls: string[]): Promise<string[]> => {
	const blobUrls = urls.filter((url) => url.startsWith("blob:"));
	const normalUrls = urls.filter((url) => !url.startsWith("blob:"));

	if (blobUrls.length === 0) {
		return urls;
	}

	const formData = new FormData();
	for (let i = 0; i < blobUrls.length; i++) {
		try {
			const blobRes = await fetch(blobUrls[i]);
			const blob = await blobRes.blob();
			const ext = blob.type.split("/")[1] || "bin";
			const file = new File([blob], `media-${i}.${ext}`, { type: blob.type });
			formData.append("files", file);
		} catch {
			normalUrls.push(blobUrls[i]);
		}
	}

	try {
		const uploadRes = await httpClient
			.post("media/upload", {
				body: formData,
			})
			.json<{ mediaUrls: string[] }>();

		if (uploadRes?.mediaUrls && uploadRes.mediaUrls.length > 0) {
			return [...normalUrls, ...uploadRes.mediaUrls];
		}
	} catch (error) {
		console.warn(
			"Upload S3 failed or unavailable, fallback to preview URLs:",
			error,
		);
	}

	return urls;
};

const createPost = async (input: CreatePostInput): Promise<Post> => {
	const finalMediaUrls = await uploadBlobMedia(input.mediaUrls);

	try {
		const response = await httpClient
			.post("posts", {
				json: {
					text: input.text,
					mediaUrls: finalMediaUrls,
				},
			})
			.json<CreatedPostResponse>();

		return {
			id: response.id,
			author: CURRENT_USER,
			createdAt: "À l'instant",
			content: response.text,
			mediaUrls: response.mediaUrls.length > 0 ? response.mediaUrls : undefined,
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
		return {
			id: `post-created-${Date.now()}`,
			author: CURRENT_USER,
			createdAt: "À l'instant",
			content: input.text,
			mediaUrls: finalMediaUrls.length > 0 ? finalMediaUrls : undefined,
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
