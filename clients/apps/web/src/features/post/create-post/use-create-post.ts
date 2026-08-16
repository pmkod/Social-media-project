import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import type { Post } from "../common/post.ts";
import { feedQueryKey } from "../feed/feed.query-key.ts";
import { postsQueryKey } from "../posts.query-key.ts";

export type CreatePostInput = {
	text: string;
	medias?: File[];
};

type CreatedPostResponse = {
	message: string;
	post: Post;
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

	const response = await httpClient
		.post("posts", {
			body: formData,
		})
		.json<CreatedPostResponse>();

	return response.post;
};

const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postsQueryKey.root });
			queryClient.invalidateQueries({ queryKey: feedQueryKey.root });
		},
	});
};

export { useCreatePost };
