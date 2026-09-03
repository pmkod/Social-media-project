import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/core/http-clients/http-client.ts";
import { userDetailsQueryKeys } from "@/features/user/common/user-details-query-keys.ts";
import type { Post, PostType } from "../common/post.ts";
import { postListQueryKeys } from "../common/post-list.query-keys.ts";

type CreatePostInput = {
	type?: PostType;
	text: string;
	medias?: File[];
};

type CreatedPostResponse = {
	message: string;
	post: Post;
};

const createPost = async (input: CreatePostInput): Promise<Post> => {
	const formData = new FormData();
	formData.append("type", input.type ?? "POST");
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
			timeout: 120_000,
		})
		.json<CreatedPostResponse>();

	return response.post;
};

const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPost,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userDetailsQueryKeys.root });
			queryClient.invalidateQueries({ queryKey: postListQueryKeys.root });
		},
	});
};

export { useCreatePost };
